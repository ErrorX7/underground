let database;
let writes = Promise.resolve();

function openDatabase() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open('underground-local-archive-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('records', {keyPath:'id'});
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); database = undefined; };
      resolve(request.result);
    };
    request.onerror = () => { database = undefined; reject(request.error); };
    request.onblocked = () => reject(new Error('请关闭其他档案页面后重试。'));
  });
  return database;
}

async function transaction(mode, action) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('records', mode);
    const request = action(tx.objectStore('records'));
    tx.oncomplete = () => resolve(request.result);
    tx.onabort = () => reject(tx.error || new Error('保存中断，请重试。'));
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadRecords(seeds) {
  const saved = await transaction('readonly', store => store.getAll());
  const byId = new Map(saved.map(item => [item.id, item.record]));
  const seedIds = new Set(seeds.map(item => item.id));
  const additions = saved.filter(item => !seedIds.has(item.id))
    .sort((a,b) => b.savedAt - a.savedAt).map(item => item.record);
  return [...additions, ...seeds.map(seed => byId.get(seed.id) || seed)];
}

export function saveRecord(record) {
  // Snapshot before queuing so a later edit cannot change an earlier write.
  const entry = {id:record.id, record:structuredClone(record), savedAt:Date.now()};
  const operation = writes.catch(() => {}).then(() =>
    transaction('readwrite', store => store.put(entry)));
  writes = operation;
  return operation;
}

export async function storePhoto(file) {
  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', 0.85);
  } finally { image.close(); }
}

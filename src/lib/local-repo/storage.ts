import {
  LOCAL_REPO_DB_NAME,
  LOCAL_REPO_HANDLE_KEY,
  LOCAL_REPO_STORE_NAME,
} from "~/lib/local-repo/constants";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_REPO_DB_NAME, 1);

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to open IndexedDB"));
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(LOCAL_REPO_STORE_NAME)) {
        database.createObjectStore(LOCAL_REPO_STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle) {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(LOCAL_REPO_STORE_NAME, "readwrite");
    const store = transaction.objectStore(LOCAL_REPO_STORE_NAME);
    const request = store.put(handle, LOCAL_REPO_HANDLE_KEY);

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to save directory handle"));
    };

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error ?? new Error("Failed to save directory handle"));
    };
  });

  database.close();
}

export async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const database = await openDatabase();

  const handle = await new Promise<FileSystemDirectoryHandle | null>(
    (resolve, reject) => {
      const transaction = database.transaction(LOCAL_REPO_STORE_NAME, "readonly");
      const store = transaction.objectStore(LOCAL_REPO_STORE_NAME);
      const request = store.get(LOCAL_REPO_HANDLE_KEY);

      request.onerror = () => {
        reject(request.error ?? new Error("Failed to load directory handle"));
      };

      request.onsuccess = () => {
        const value: unknown = request.result;

        if (
          value &&
          typeof value === "object" &&
          "kind" in value &&
          (value as FileSystemHandle).kind === "directory"
        ) {
          resolve(value as FileSystemDirectoryHandle);
          return;
        }

        resolve(null);
      };
    },
  );

  database.close();
  return handle;
}

export async function clearDirectoryHandle() {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(LOCAL_REPO_STORE_NAME, "readwrite");
    const store = transaction.objectStore(LOCAL_REPO_STORE_NAME);
    const request = store.delete(LOCAL_REPO_HANDLE_KEY);

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to clear directory handle"));
    };

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error ?? new Error("Failed to clear directory handle"));
    };
  });

  database.close();
}

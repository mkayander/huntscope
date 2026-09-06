import {
  LOCAL_REPO_DB_NAME,
  LOCAL_REPO_FILE_HANDLE_KEY,
  LOCAL_REPO_HANDLE_KEY,
  LOCAL_REPO_SESSION_ID_KEY,
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

async function putValue(key: string, value: unknown) {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(
      LOCAL_REPO_STORE_NAME,
      "readwrite",
    );
    const store = transaction.objectStore(LOCAL_REPO_STORE_NAME);
    const request = store.put(value, key);

    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to save ${key}`));
    };

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error ?? new Error(`Failed to save ${key}`));
    };
  });

  database.close();
}

async function getValue<T>(key: string): Promise<T | null> {
  const database = await openDatabase();

  const value = await new Promise<T | null>((resolve, reject) => {
    const transaction = database.transaction(LOCAL_REPO_STORE_NAME, "readonly");
    const store = transaction.objectStore(LOCAL_REPO_STORE_NAME);
    const request = store.get(key);

    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to load ${key}`));
    };

    request.onsuccess = () => {
      resolve((request.result as T | undefined) ?? null);
    };
  });

  database.close();
  return value;
}

async function deleteValue(key: string) {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(
      LOCAL_REPO_STORE_NAME,
      "readwrite",
    );
    const store = transaction.objectStore(LOCAL_REPO_STORE_NAME);
    const request = store.delete(key);

    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to clear ${key}`));
    };

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error ?? new Error(`Failed to clear ${key}`));
    };
  });

  database.close();
}

export async function saveLocalRepoSessionId(sessionId: string) {
  await putValue(LOCAL_REPO_SESSION_ID_KEY, sessionId);
}

export async function loadLocalRepoSessionId(): Promise<string | null> {
  const value = await getValue<string>(LOCAL_REPO_SESSION_ID_KEY);
  return typeof value === "string" ? value : null;
}

export async function clearLocalRepoSessionId() {
  await deleteValue(LOCAL_REPO_SESSION_ID_KEY);
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle) {
  const sessionId = crypto.randomUUID();
  await putValue(LOCAL_REPO_HANDLE_KEY, handle);
  await saveLocalRepoSessionId(sessionId);
  return sessionId;
}

export async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const value = await getValue<FileSystemDirectoryHandle>(
    LOCAL_REPO_HANDLE_KEY,
  );

  if (value && typeof value === "object" && value.kind === "directory") {
    return value;
  }

  return null;
}

export async function clearDirectoryHandle() {
  await deleteValue(LOCAL_REPO_HANDLE_KEY);
}

export async function saveLaunchedFileHandle(handle: FileSystemFileHandle) {
  const sessionId = crypto.randomUUID();
  await putValue(LOCAL_REPO_FILE_HANDLE_KEY, handle);
  await saveLocalRepoSessionId(sessionId);
  return sessionId;
}

export async function loadLaunchedFileHandle(): Promise<FileSystemFileHandle | null> {
  const value = await getValue<FileSystemFileHandle>(
    LOCAL_REPO_FILE_HANDLE_KEY,
  );

  if (value && typeof value === "object" && value.kind === "file") {
    return value;
  }

  return null;
}

export async function clearLaunchedFileHandle() {
  await deleteValue(LOCAL_REPO_FILE_HANDLE_KEY);
}

export async function clearAllLocalRepoHandles() {
  await clearDirectoryHandle();
  await clearLaunchedFileHandle();
  await clearLocalRepoSessionId();
}

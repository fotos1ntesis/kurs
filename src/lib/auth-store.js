import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const scryptAsync = promisify(scrypt);
const storePath = path.join(process.cwd(), "data", "users.json");
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;
let storeQueue = Promise.resolve();

async function withStore(operation) {
  const result = storeQueue.then(async () => {
    let store;

    try {
      store = JSON.parse(await readFile(storePath, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }

      await mkdir(path.dirname(storePath), { recursive: true });
      store = { users: [], sessions: [], purchases: [] };
    }

    if (!Array.isArray(store.purchases)) {
      store.purchases = [];
    }

    const outcome = await operation(store);

    if (outcome.write) {
      await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
    }

    return outcome.value;
  });

  storeQueue = result.then(
    () => undefined,
    () => undefined,
  );

  return result;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const derivedKey = await scryptAsync(password, salt, 64);
  return { salt, passwordHash: derivedKey.toString("hex") };
}

export async function registerUser({ name, email, password }) {
  const credentials = await hashPassword(password);

  return withStore((store) => {
    if (store.users.some((user) => user.email === email)) {
      return { value: null, write: false };
    }

    const user = {
      id: randomUUID(),
      name,
      email,
      ...credentials,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);

    return { value: publicUser(user), write: true };
  });
}

export async function authenticateUser(email, password) {
  return withStore(async (store) => {
    const user = store.users.find((item) => item.email === email);
    if (!user) {
      return { value: null, write: false };
    }

    const { passwordHash } = await hashPassword(password, user.salt);
    const actual = Buffer.from(passwordHash, "hex");
    const expected = Buffer.from(user.passwordHash, "hex");

    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return { value: null, write: false };
    }

    return { value: publicUser(user), write: false };
  });
}

export async function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const sessionHash = createHash("sha256").update(token).digest("hex");

  await withStore((store) => {
    const now = Date.now();
    store.sessions = store.sessions.filter(
      (session) => new Date(session.expiresAt).getTime() > now,
    );
    store.sessions.push({
      tokenHash: sessionHash,
      userId,
      expiresAt: new Date(now + SESSION_DURATION).toISOString(),
    });

    return { value: undefined, write: true };
  });

  return token;
}

export async function getSessionUser(token) {
  if (!token) {
    return null;
  }

  const sessionHash = createHash("sha256").update(token).digest("hex");

  return withStore((store) => {
    const session = store.sessions.find(
      (item) =>
        item.tokenHash === sessionHash &&
        new Date(item.expiresAt).getTime() > Date.now(),
    );
    const user = session
      ? store.users.find((item) => item.id === session.userId)
      : null;

    return { value: user ? publicUser(user) : null, write: false };
  });
}

export async function deleteSession(token) {
  if (!token) {
    return;
  }

  const sessionHash = createHash("sha256").update(token).digest("hex");

  await withStore((store) => {
    const previousLength = store.sessions.length;
    store.sessions = store.sessions.filter(
      (session) => session.tokenHash !== sessionHash,
    );

    return {
      value: undefined,
      write: store.sessions.length !== previousLength,
    };
  });
}

export async function getUserPurchases(userId) {
  return withStore((store) => ({
    value: store.purchases.filter((purchase) => purchase.userId === userId),
    write: false,
  }));
}

export async function addCoursePurchase(userId, courseId) {
  return withStore((store) => {
    const existing = store.purchases.find(
      (purchase) =>
        purchase.userId === userId && purchase.courseId === courseId,
    );

    if (existing) {
      return { value: { purchase: existing, alreadyPurchased: true }, write: false };
    }

    const purchase = {
      userId,
      courseId,
      purchasedAt: new Date().toISOString(),
    };
    store.purchases.push(purchase);

    return { value: { purchase, alreadyPurchased: false }, write: true };
  });
}

export { SESSION_DURATION };

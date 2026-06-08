import { MongoClient } from 'mongodb';
import { MongoCourseRepository, MongoEnrollmentRepository } from './mongo-repositories.js';

export async function connectMongo() {
  const mongoUri = process.env.MONGO_URI ?? 'mongodb://mongo:27017/learning_system_db';
  const dbName = process.env.MONGO_DB ?? 'learning_system_db';

  const client = new MongoClient(mongoUri);

  let lastError: unknown;

  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await client.connect();
      const db = client.db(dbName);
      return {
        client,
        courseRepository: new MongoCourseRepository(db.collection('course') as any),
        enrollmentRepository: new MongoEnrollmentRepository(db.collection('enrollment') as any),
      };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  await client.close().catch(() => undefined);
  throw lastError instanceof Error ? lastError : new Error('Failed to connect to MongoDB');
}

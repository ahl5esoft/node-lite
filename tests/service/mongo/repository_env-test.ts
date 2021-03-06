import { deepStrictEqual } from 'assert';

import { MongoFactory } from '../../../src';
import { toEntries } from '../../../src/service/mongo/helper';
import { Pool } from '../../../src/service/mongo/pool';
import { Repository as Self } from '../../../src/service/mongo/repository';
import { UnitOfWork } from '../../../src/service/mongo/unit-of-work';

const dbFactory = new MongoFactory('test-repository', 'mongodb://localhost:27017');
const pool = new Pool('test-repository', 'mongodb://localhost:27017');

describe('src/service/mongo/repository.ts', (): void => {
    after(async (): Promise<void> => {
        const db = await pool.getDb();
        await db.dropDatabase();

        const client = await pool.getClient();
        await client.close();

        await dbFactory.close();
    });

    describe('.add(entry: any): Promise<void>', (): void => {
        const table = 'add';
        it('m_IsTx = true', async (): Promise<void> => {
            const uow = new UnitOfWork(pool);
            const self = new Self(pool, dbFactory, table, uow);
            const entry = {
                id: `${table}-1`,
                name: 'test',
            };
            await self.add(entry);

            const db = await pool.getDb();
            const res = await db.collection(table).find().toArray();
            deepStrictEqual(res, []);
        });

        it('m_IsTx = false', async (): Promise<void> => {
            const self = new Self(pool, dbFactory, table, null);
            const entry = {
                id: `${table}-2`,
                name: 'test',
            };
            await self.add(entry);

            const db = await pool.getDb();
            const res = await db.collection(table).find().toArray();
            deepStrictEqual(
                toEntries(res),
                [entry]
            );
        });
    });

    describe('.query(): IQuery', (): void => {
        const table = 'test-query-toArray';
        it('ok', async () => {
            const rows = [{
                _id: `${table}-1`,
            }, {
                _id: `${table}-2`,
            }];
            const db = await pool.getDb();
            const collection = db.collection(table);
            await collection.insertMany(rows);

            const res = await new Self(pool, dbFactory, table, null).query().toArray();

            await collection.deleteMany(null);

            deepStrictEqual(
                res,
                toEntries(rows)
            );
        });

        it('where', async () => {
            const rows = [{
                _id: `${table}-3`,
            }, {
                _id: `${table}-4`,
            }];
            const db = await pool.getDb();
            const collection = db.collection(table);
            await collection.insertMany(rows);

            const res = await new Self(pool, dbFactory, table, null).query().where({
                id: rows[0]._id
            }).toArray();

            await collection.deleteMany(null);

            deepStrictEqual(
                res,
                toEntries([rows[0]])
            );
        });
    });

    describe('.remove(entry: any): Promise<void>', (): void => {
        const table = 'remove';
        it('m_IsTx = true', async (): Promise<void> => {
            const rows = [{
                _id: `${table}-1`,
            }];
            const db = await pool.getDb();
            const collection = db.collection(table);
            await collection.insertMany(rows);

            const uow = new UnitOfWork(pool);
            const self = new Self(pool, dbFactory, table, uow);
            await self.remove({
                id: rows[0]._id,
            });

            const res = await db.collection(table).find().toArray();
            deepStrictEqual(res, rows);

            await collection.deleteMany(null);
        });

        it('m_IsTx = false', async (): Promise<void> => {
            const rows = [{
                _id: `${table}-1`,
            }];
            const db = await pool.getDb();
            const collection = db.collection(table);
            await collection.insertMany(rows);

            const self = new Self(pool, dbFactory, table, null);
            await self.remove({
                id: rows[0]._id,
            });

            const res = await db.collection(table).find().toArray();
            deepStrictEqual(res, []);
        });
    });

    describe('.save(entry: any): Promise<void>', (): void => {
        const table = 'save';
        it('m_IsTx = true', async (): Promise<void> => {
            const rows = [{
                _id: `${table}-1`,
                name: 'one',
            }];
            const db = await pool.getDb();
            const collection = db.collection(table);
            await collection.insertMany(rows);

            const uow = new UnitOfWork(pool);
            const self = new Self(pool, dbFactory, table, uow);
            let entry = toEntries(rows)[0];
            entry.name = 'two';
            await self.save(entry);

            const res = await db.collection(table).find().toArray();
            deepStrictEqual(res, rows);

            await collection.deleteMany(null);
        });

        it('m_IsTx = false', async (): Promise<void> => {
            const rows = [{
                _id: `${table}-2`,
                name: 'one',
            }];
            const db = await pool.getDb();
            const collection = db.collection(table);
            await collection.insertMany(rows);

            const self = new Self(pool, dbFactory, table, null);
            let entry = toEntries(rows)[0];
            entry.name = 'two';
            await self.save(entry);

            const res = await db.collection(table).find().toArray();
            deepStrictEqual(res, [{
                _id: rows[0]._id,
                name: entry.name,
            }]);

            await collection.deleteMany(null);
        });
    });
});

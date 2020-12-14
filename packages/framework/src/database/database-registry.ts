/*
 * Deepkit Framework
 * Copyright (C) 2020 Deepkit UG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {inject} from '../injector/injector';
import {Database} from '@deepkit/orm';
import {ClassType} from '@deepkit/core';
import {ClassSchema, getClassSchema} from '@deepkit/type';
import {databaseConfig} from './database.config';
import {InjectorContext} from '../injector/injector';

/**
 * Class to register a new database and resolve a schema/type to a database.
 */
export class DatabaseRegistry {
    protected databaseMap = new Map<string, Database<any>>();

    constructor(
        protected scopedContext: InjectorContext,
        @inject(databaseConfig.token('databases')) public databaseTypes: ClassType<Database<any>>[]
    ) {
        this.init();
    }

    public onShutDown() {
        for (const database of this.databaseMap.values()) {
            database.disconnect();
        }
    }

    public init() {
        for (const databaseType of this.databaseTypes) {
            const database = this.scopedContext.get(databaseType);
            if (this.databaseMap.has(database.name)) continue;

            for (const classSchema of database.entities) {
                classSchema.data['orm.database'] = database;
            }

            this.databaseMap.set(database.name, database);
        }
    }

    getDatabaseForEntity(entity: ClassSchema | ClassType): Database<any> {
        const schema = getClassSchema(entity);
        const database = schema.data['orm.database'];
        if (!database) throw new Error(`Class ${schema.getClassName()} is not assigned to a database`);
        return database;
    }

    getDatabases() {
        return this.databaseMap.values();
    }

    getDatabase(name: string): Database<any> | undefined {
        return this.databaseMap.get(name);
    }
}
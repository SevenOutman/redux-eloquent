import * as Redux from 'redux';
import Utils from '../support/Utils'
import Container from '../container/Container'
import Database from '../database/Database'
import Record from '../data/Record';
import Item from '../data/Item'
import Collection from '../data/Collection'
import Collections from '../data/Collections'
import State from '../modules/contracts/State'
import * as Attributes from '../attributes'
import Mutator from '../attributes/contracts/Mutator'
import Mutators from '../attributes/contracts/Mutators'
import Query from '../query/Query'
import * as Payloads from '../modules/payloads/Actions'
import Fields from './contracts/Fields'
import ModelState from './contracts/State'
import Serializer from './Serializer'
import * as Data from "@/lib/data";
import PersistOptions from "@/lib/modules/payloads/PersistOptions";
import OptionsBuilder from "@/lib/modules/support/OptionsBuilder";

type InstanceOf<T> = T extends new (...args: any[]) => infer R ? R : any

export default class Model {

    /**
     * The name that is going be used as module name in Vuex Store.
     */
    static $entity: string

    static get entity(): string {
        return this.$entity || `${this.name.toLowerCase()}s`;
    }

    static set entity(value) {
        this.$entity = value;
    }

    /**
     * The primary key to be used for the model.
     */
    static primaryKey: string | string[] = 'id'

    /**
     * Vuex Store state definition.
     */
    static state: ModelState | (() => ModelState) = {}

    /**
     * The cached attribute fields of the model.
     */
    static cachedFields?: Fields

    /**
     * The ID value of the store index.
     */
    $id: string | null = null

    /**
     * Create a new model instance.
     */
    constructor(record?: Record) {
        this.$fill(record)
    }

    /**
     * The definition of the fields of the model and its relations.
     */
    static fields(): Fields {
        return {}
    }

    /**
     * Get the model schema definition by adding additional default fields.
     */
    static getFields(): Fields {
        if (this.cachedFields) {
            return this.cachedFields
        }

        this.cachedFields = this.fields()

        return this.cachedFields
    }

    /**
     * Create an attr attribute. The given value will be used as a default
     * value for the field.
     */
    static attr(defaultValue: any, mutator?: Mutator<any>): Attributes.Attr {
        return new Attributes.Attr(this, defaultValue, mutator)
    }

    /**
     * Create a string attribute.
     */
    static string(defaultValue: any, mutator?: Mutator<string | null>): Attributes.String {
        return new Attributes.String(this, defaultValue, mutator)
    }

    /**
     * Create a number attribute.
     */
    static number(defaultValue: any, mutator?: Mutator<number | null>): Attributes.Number {
        return new Attributes.Number(this, defaultValue, mutator)
    }

    /**
     * Create a boolean attribute.
     */
    static boolean(defaultValue: any, mutator?: Mutator<boolean | null>): Attributes.Boolean {
        return new Attributes.Boolean(this, defaultValue, mutator)
    }

    /**
     * Create an increment attribute. The field with this attribute will
     * automatically increment its value when creating a new record.
     */
    static increment(): Attributes.Increment {
        return new Attributes.Increment(this)
    }

    /**
     * Create a has one relationship.
     */
    static hasOne(related: typeof Model | string, foreignKey: string, localKey?: string): Attributes.HasOne {
        return new Attributes.HasOne(this, related, foreignKey, this.localKey(localKey))
    }

    /**
     * Create a belongs to relationship.
     */
    static belongsTo(parent: typeof Model, foreignKey?: string, ownerKey?: string): Attributes.BelongsTo {
        if (!foreignKey) {
            foreignKey = `${parent.name.toLowerCase()}_${parent.primaryKey}`;
        }
        return new Attributes.BelongsTo(this, parent, foreignKey, this.relation(parent).localKey(ownerKey))
    }

    /**
     * Create a has many relationship.
     */
    static hasMany(related: typeof Model | string, foreignKey?: string, localKey?: string): Attributes.HasMany {
        if (!foreignKey) {
            foreignKey = `${this.name.toLowerCase()}_${this.primaryKey}`
        }

        return new Attributes.HasMany(this, related, foreignKey, this.localKey(localKey))
    }

    /**
     * Create a has many by relationship.
     */
    static hasManyBy(parent: typeof Model | string, foreignKey: string, ownerKey?: string): Attributes.HasManyBy {
        return new Attributes.HasManyBy(this, parent, foreignKey, this.relation(parent).localKey(ownerKey))
    }

    /**
     * Create a has many through relationship.
     */
    static hasManyThrough(
        related: typeof Model | string,
        through: typeof Model | string,
        firstKey: string,
        secondKey: string,
        localKey?: string,
        secondLocalKey?: string
    ): Attributes.HasManyThrough {
        return new Attributes.HasManyThrough(
            this,
            related,
            through,
            firstKey,
            secondKey,
            this.localKey(localKey),
            this.relation(through).localKey(secondLocalKey)
        )
    }

    /**
     * The belongs to many relationship.
     */
    static belongsToMany(
        related: typeof Model | string,
        pivot: typeof Model | string,
        foreignPivotKey: string,
        relatedPivotKey: string,
        parentKey?: string,
        relatedKey?: string
    ): Attributes.BelongsToMany {
        return new Attributes.BelongsToMany(
            this,
            related,
            pivot,
            foreignPivotKey,
            relatedPivotKey,
            this.localKey(parentKey),
            this.relation(related).localKey(relatedKey)
        )
    }

    /**
     * Create a morph to relationship.
     */
    static morphTo(id: string, type: string): Attributes.MorphTo {
        return new Attributes.MorphTo(this, id, type)
    }

    /**
     * Create a morph one relationship.
     */
    static morphOne(related: typeof Model | string, id: string, type: string, localKey?: string): Attributes.MorphOne {
        return new Attributes.MorphOne(this, related, id, type, this.localKey(localKey))
    }

    /**
     * Create a morph many relationship.
     */
    static morphMany(related: typeof Model | string, id: string, type: string, localKey?: string): Attributes.MorphMany {
        return new Attributes.MorphMany(this, related, id, type, this.localKey(localKey))
    }

    /**
     * Create a morph to many relationship.
     */
    static morphToMany(
        related: typeof Model | string,
        pivot: typeof Model | string,
        relatedId: string,
        id: string,
        type: string,
        parentKey?: string,
        relatedKey?: string
    ): Attributes.MorphToMany {
        return new Attributes.MorphToMany(
            this,
            related,
            pivot,
            relatedId,
            id,
            type,
            this.localKey(parentKey),
            this.relation(related).localKey(relatedKey)
        )
    }

    /**
     * Create a morphed by many relationship.
     */
    static morphedByMany(
        related: typeof Model | string,
        pivot: typeof Model | string,
        relatedId: string,
        id: string,
        type: string,
        parentKey?: string,
        relatedKey?: string
    ): Attributes.MorphedByMany {
        return new Attributes.MorphedByMany(
            this,
            related,
            pivot,
            relatedId,
            id,
            type,
            this.localKey(parentKey),
            this.relation(related).localKey(relatedKey)
        )
    }

    /**
     * Mutators to mutate matching fields when instantiating the model.
     */
    static mutators(): Mutators {
        return {}
    }

    /**
     * Get the database instance from the container.
     */
    static database(): Database {
        return Container.database
    }

    /**
     * Get the store instance from the container.
     */
    static store(): Redux.Store<any> {
        return this.database().store
    }

    /**
     * Create a namespaced method name for Vuex Module from the given
     * method name.
     */
    static namespace(method: string = ''): string {
        return `${this.database().namespace}/${this.entity}/${method}`
    }

    /**
     * Call Vuex Getters.
     */
    static getters(method: string): any {
        const query = this.reselectSelector(this.store().getState());
        if (method === 'query') return query;

        return query[method].bind(query);
    }

    static reduxReducer(state = {
        $connection: this.namespace(),
        $name: this.entity,
        data: {}
    }, action: { type: string }) {
        return state;
    }

    static reselectSelector<T extends typeof Model>(this: T, state: any = this.store().getState()): Query<InstanceOf<T>> {
        return new Query(state[this.database().namespace], this.entity);
    }

    /**
     * Dispatch Vuex Action.
     */
    static dispatch(method: string, payload?: any): any {
        const query = new Query(this.store().getState()[this.database().namespace], this.entity);
        return this.store().dispatch({
            type: `${this.database().namespace}/${method}`,
            payload: {
                entity: this.entity,
                query,
                ...payload
            }
        });
    }

    /**
     * Commit Vuex Mutation.
     */
    static commit(callback: (state: State) => void) {
        console.log(callback);
        // this.store().commit(`${this.database().namespace}/$mutate`, {
        //     entity: this.entity,
        //     callback
        // })
    }

    /**
     * Get all records.
     */
    static all<T extends typeof Model>(this: T): Collection<InstanceOf<T>> {
        return this.getters('all')()
    }

    /**
     * Find a record.
     */
    static find<T extends typeof Model>(this: T, id: string | number): Item<InstanceOf<T>> {
        return this.getters('find')(id)
    }

    /**
     * Get the record of the given array of ids.
     */
    static findIn<T extends typeof Model>(this: T, idList: Array<number | string>): Collection<InstanceOf<T>> {
        return this.getters('findIn')(idList)
    }

    /**
     * Get query instance.
     */
    static query<T extends typeof Model>(this: T): Query<InstanceOf<T>> {
        return this.reselectSelector();
    }

    /**
     * Create new data with all fields filled by default values.
     */
    static new(): Promise<Model> {
        return this.dispatch('new')
    }

    /**
     * Save given data to the store by replacing all existing records in the
     * store. If you want to save data without replacing existing records,
     * use the `insert` method instead.
     */
    static create<T extends typeof Model>(this: T, payload: Payloads.Create): Promise<Collections<InstanceOf<T>>> {
        return this.dispatchPersist('create', payload)
    }

    /**
     * Insert records.
     */
    static insert<T extends typeof Model>(this: T, payload: Payloads.Insert): Promise<Collections<InstanceOf<T>>> {
        const options = OptionsBuilder.createPersistOptions(payload)
        return this.dispatchPersist('insert', {...payload, options})
    }

    /**
     * Update records.
     */
    static update<T extends typeof Model>(this: T, payload: Payloads.Update): Promise<Collections<InstanceOf<T>>> {
        return this.dispatchPersist('update', payload)
    }

    /**
     * Insert or update records.
     */
    static insertOrUpdate<T extends typeof Model>(this: T, payload: Payloads.InsertOrUpdate): Promise<Collections<InstanceOf<T>>> {
        return this.dispatchPersist('insertOrUpdate', payload)
    }

    /**
     * Delete records that matches the given condition.
     */
    static delete<T extends typeof Model>(this: T, payload: Payloads.Delete): Promise<Item<InstanceOf<T>> | Collection<InstanceOf<T>>> {
        return this.dispatch('delete', payload)
    }

    /**
     * Delete all records.
     */
    static deleteAll(): Promise<void> {
        return this.dispatch('deleteAll')
    }

    /**
     * Get the value of the primary key.
     */
    static id(record: any): any {
        const key = this.primaryKey

        if (typeof key === 'string') {
            return record[key]
        }

        return key.map(k => record[k]).join('_')
    }

    /**
     * Get local key to pass to the attributes.
     */
    static localKey(key?: string): string {
        if (key) {
            return key
        }

        return typeof this.primaryKey === 'string' ? this.primaryKey : 'id'
    }

    /**
     * Get a model from the container.
     */
    static relation(model: typeof Model | string): typeof Model {
        if (typeof model !== 'string') {
            return model
        }

        return this.database().model(model)
    }

    /**
     * Get the attribute class for the given attribute name.
     */
    static getAttributeClass(name: string): typeof Attributes.Attribute {
        switch (name) {
            case 'increment':
                return Attributes.Increment

            default:
                throw Error(`The attribute name "${name}" doesn't exists.`)
        }
    }

    /**
     * Get all of the fields that matches the given attribute name.
     */
    static getFieldsByAttribute(name: string): { [key: string]: Attributes.Attribute } {
        const attr = this.getAttributeClass(name)
        const fields = this.fields()

        return Object.keys(fields).reduce((newFields, key) => {
            const field = fields[key]

            if (field instanceof attr) {
                newFields[key] = field
            }

            return newFields
        }, {} as { [key: string]: Attributes.Attribute })
    }

    /**
     * Get all `increment` fields from the schema.
     */
    static getIncrementFields(): { [key: string]: Attributes.Increment } {
        return this.getFieldsByAttribute('increment') as { [key: string]: Attributes.Increment }
    }

    /**
     * Check if fields contains the `increment` field type.
     */
    static hasIncrementFields(): boolean {
        return Object.keys(this.getIncrementFields()).length > 0
    }

    /**
     * Get all `belongsToMany` fields from the schema.
     */
    static pivotFields(): { [key: string]: Attributes.BelongsToMany | Attributes.MorphToMany | Attributes.MorphedByMany }[] {
        const fields: { [key: string]: Attributes.BelongsToMany | Attributes.MorphToMany | Attributes.MorphedByMany }[] = []

        Utils.forOwn(this.fields(), (field, key) => {
            if (field instanceof Attributes.BelongsToMany || field instanceof Attributes.MorphToMany || field instanceof Attributes.MorphedByMany) {
                fields.push({[key]: field})
            }
        })

        return fields
    }

    /**
     * Check if fields contains the `belongsToMany` field type.
     */
    static hasPivotFields(): boolean {
        return this.pivotFields().length > 0
    }

    /**
     * Fill any missing fields in the given record with the default value defined
     * in the model schema.
     */
    static hydrate(record?: Record): Record {
        return (new this(record)).$toJson()
    }

    /**
     * Get the constructor of this model.
     */
    $self(): typeof Model {
        return this.constructor as typeof Model
    }

    /**
     * The definition of the fields of the model and its relations.
     */
    $fields(): Fields {
        return this.$self().getFields()
    }

    /**
     * Get the store instance from the container.
     */
    $store(): Redux.Store<any> {
        return this.$self().store()
    }

    /**
     * Create a namespaced method name for Vuex Module from the given
     * method name.
     */
    $namespace(method?: string): string {
        return this.$self().namespace(method)
    }

    /**
     * Call Vuex Getetrs.
     */
    $getters(method: string): any {
        return this.$self().getters(method)
    }

    /**
     * Dispatch Vuex Action.
     */
    async $dispatch(method: string, payload?: any): Promise<any> {
        return this.$self().dispatch(method, payload)
    }

    /**
     * Get all records.
     */
    $all<T extends Model>(this: T): Collection<T> {
        return this.$getters('all')()
    }

    /**
     * Find a record.
     */
    $find<T extends Model>(this: T, id: string | number): Item<T> {
        return this.$getters('find')(id)
    }

    /**
     * Find record of the given array of ids.
     */
    $findIn<T extends Model>(this: T, idList: Array<number | string>): Collection<T> {
        return this.$getters('findIn')(idList)
    }

    /**
     * Get query instance.
     */
    $query(): Query {
        return this.$getters('query')()
    }

    /**
     * Create records.
     */
    async $create<T extends Model>(this: T, payload: Payloads.Create): Promise<Collections<T>> {
        return this.$dispatch('create', payload)
    }

    /**
     * Create records.
     */
    async $insert<T extends Model>(this: T, payload: Payloads.Insert): Promise<Collections<T>> {
        return this.$dispatch('insert', payload)
    }

    /**
     * Update records.
     */
    async $update<T extends Model>(this: T, payload: Payloads.Update): Promise<Collections<T>> {
        if (Array.isArray(payload)) {
            return this.$dispatch('update', payload)
        }

        if (payload.where !== undefined) {
            return this.$dispatch('update', payload)
        }

        if (this.$self().id(payload) === undefined) {
            return this.$dispatch('update', {where: this.$id, data: payload})
        }

        return this.$dispatch('update', payload)
    }

    /**
     * Insert or update records.
     */
    async $insertOrUpdate<T extends Model>(this: T, payload: Payloads.InsertOrUpdate): Promise<Collections<T>> {
        return this.$dispatch('insertOrUpdate', payload)
    }

    /**
     * Save record.
     */
    async $save<T extends Model>(this: T): Promise<Item<T>> {
        const fields = this.$self().getFields()

        const record = Object.keys(fields).reduce((record, key) => {
            if (fields[key] instanceof Attributes.Type) {
                record[key] = this[key]
            }

            return record
        }, {} as Record)

        const records = await this.$dispatch('insertOrUpdate', {data: record})

        this.$fill(records[this.$self().entity][0])

        return this
    }

    /**
     * Delete records that matches the given condition.
     */
    async $delete<T extends Model>(this: T, condition?: Payloads.Delete): Promise<Item<T> | Collection<T>> {
        if (condition) {
            return this.$dispatch('delete', condition)
        }

        if (this.$id === null) {
            return null
        }

        return this.$dispatch('delete', this.$id)
    }

    /**
     * Delete all records.
     */
    async $deleteAll(): Promise<void> {
        return this.$dispatch('deleteAll')
    }

    /**
     * Fill the model instance with the given record. If no record were passed,
     * or if the record has any missing fields, each value of the fields will
     * be filled with its default value defined at model fields definition.
     */
    $fill(record?: Record): void {
        const data = record || {}
        const fields = this.$fields()

        Object.keys(fields).forEach((key) => {
            const field = fields[key]
            const value = data[key]

            this[key] = field.make(value, data, key)
        })

        if (data.$id !== undefined) {
            this.$id = data.$id
        }
    }

    /**
     * Serialize field values into json.
     */
    $toJson(): Record {
        return Serializer.serialize(this)
    }

    /**
     * This method is used by Nuxt server-side rendering. It will prevent
     * `non-POJO` warning when using Vuex ORM with Nuxt universal mode.
     * The method is not meant to be used publicly by a user.
     *
     * See https://github.com/vuex-orm/vuex-orm/issues/255 for more detail.
     */
    toJSON(): Record {
        return this.$toJson()
    }

    /**
     * Convert given record to the model instance.
     */
    protected static instantiate(record: Data.Record): Data.Instance {
        return new this(record)
    }

    /**
     * Convert all given records to model instances.
     */
    protected static instantiateMany(records: Data.Records): Data.Instances {
        return Object.keys(records).reduce<Data.Instances>((instances, id) => {
            const record = records[id]

            instances[id] = this.instantiate(record)

            return instances
        }, {})
    }

    protected static dispatchPersist(method: string, payload: any): any {
        const query = new Query(this.store().getState()[this.database().namespace], this.entity);
        const result = query.normalize(payload.data);

        return this.dispatch(method, {...payload, result});
    }

    protected static createMany(state: State, records: Data.Records): State {
        const instances = this.instantiateMany(records);

        return {
            ...state,
            data: instances
        };
    }

    protected static insertMany(state: State, records: Data.Records): State {
        const instances = this.instantiateMany(records);

        return {
            ...state,
            data: {
                ...state.data,
                ...instances
            }
        };
    }

    protected static getPersistMethod(entity: string, method: string, options: PersistOptions = {}): string {
        if (options.create && options.create.includes(entity)) {
            return 'create'
        }

        if (options.insert && options.insert.includes(entity)) {
            return 'insert'
        }

        if (options.update && options.update.includes(entity)) {
            return 'update'
        }

        if (options.insertOrUpdate && options.insertOrUpdate.includes(entity)) {
            return 'insertOrUpdate'
        }

        return method
    }

    static getReducer(): Redux.Reducer {
        return (state: State = {
            $connection: this.database().namespace,
            $name: this.entity,
            data: {}
        }, action: Redux.AnyAction) => {
            if (!action.type.startsWith(this.database().namespace)) {
                return state;
            }
            const records = action.payload.result[this.entity];
            if (!records) {
                return state;
            }

            const command = action.type.split('/')[1];
            switch (command) {
                case 'create':
                case 'insert':
                    const query = action.payload.query.newQuery(this.entity);
                    const method = query.getPersistMethod(this.entity, command, action.payload.options)
                    return query[`${method}Many`](records);
                default:
                    return state;
            }
        }
    }


}

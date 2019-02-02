import * as Redux from 'redux';
import Schema from '../schema/Schema'
import Schemas from '../schema/Schemas'
import Model from '../model/Model'
// import ModuleBuilder from '../modules/builder/Builder'
import Entity from './Entity'
import Models from './Models'
import RootMutations from "@/lib/modules/RootMutations";

export default class Database {
    /**
     * The Vuex Store instance.
     */
    store!: Redux.Store<any>

    /**
     * The namespace of the Vuex Store Module where the database is registered.
     */
    namespace!: string

    /**
     * The list of entities to be registered to the Vuex Store. It contains
     * models and modules with its name.
     */
    entities: Entity[] = []

    /**
     * The database schema definition. This schema will be used when normalizing
     * the data before persisting them to the Vuex Store.
     */
    schemas: Schemas = {}


    constructor(name = 'db', models: Array<typeof Model>) {
        for (const model of models) {
            this.register(model);
        }
        this.namespace = name
    }

    /**
     * Initialize the database before a user can start using it.
     */
    start(store: Redux.Store<any>): void {
        this.store = store;
        // this.registerModules()

        this.createSchema()
    }

    /**
     * Register a model and a module to Database.
     */
    register(model: typeof Model, module: Redux.Reducer<any, any> = (state = {}) => state): void {
        this.entities.push({
            name: model.entity,
            model,
            module
        })
    }

    /**
     * Get the model of the given name from the entities list.
     */
    model(name: string): typeof Model {
        return this.models()[name]
    }

    /**
     * Get all models from the entities list.
     */
    models(): Models {
        return this.entities.reduce((models, entity) => {
            models[entity.name] = entity.model

            return models
        }, {} as Models)
    }

    /**
     * Get the module of the given name from the entities list.
     */
    module(name: string): Redux.Reducer<any, any> {
        return this.modules()[name]
    }

    /**
     * Get all modules from the entities list.
     */
    modules(): Redux.ReducersMapObject {
        return this.entities.reduce((modules, entity) => {
            modules[entity.name] = entity.module

            return modules
        }, {} as Redux.ReducersMapObject)
    }

    /**
     * Create the Vuex Module from registered entities.
     */
    // registerModules(): void {
    //     const reducer = ModuleBuilder.create(this.namespace, this.models(), this.modules())
    //
    //     // this.store.replaceReducer(reducer);
    //     console.log(reducer);
    // }

    /**
     * Create the schema definition from registered entities list and set
     * it to the property. This schema will be used by the normalizer
     * to normalize data before persisting them to the Vuex Store.
     */
    createSchema(): void {
        this.entities.forEach((entity) => {
            this.schemas[entity.name] = Schema.create(entity.model)
        })
    }

    getReducer(): Redux.Reducer {
        const initialState = Object.keys(this.models()).reduce((acc, name) => {
            const model = this.model(name);
            return {
                // @ts-ignore
                ...acc,
                [name]: {
                    $connection: this.namespace,
                    $name: model.entity,
                    data: {}
                }
            }
        }, {})


        return (state = initialState, action) => {
            if (!action.type.startsWith(this.namespace)) {
                return state;
            }
            const segs = action.type.split('/');
            const method = segs[1];
            RootMutations[method](state, {...action.payload, result: {data: {}}});
            return {...state};
        }
    }
    // getReducer(): Redux.Reducer {
    //     return Redux.combineReducers(Object.keys(this.models()).reduce((acc, name) => {
    //         const model = this.model(name);
    //         return {
    //             // @ts-ignore
    //             ...acc,
    //             [name]: model.getReducer()
    //         }
    //     }, {}));
    // }
}

import Model from '@/lib/model/Model';
import Author from "@/redux/eloquent/Author";

export default class Book extends Model {

    public static fields(): any {
        return {
            id: this.number(null),
            title: this.string(null),
            author_id: this.number(null),
            // relations
            author: this.belongsTo(Author)
        }
    }
}

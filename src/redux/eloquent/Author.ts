import Model from '@/lib/model/Model';
import Book from './Book';

export default class Author extends Model {
    public static fields(): any {
        return {
            id: this.number(null),
            name: this.string('Tom'),
            books: this.hasMany(Book)
        }
    }
}

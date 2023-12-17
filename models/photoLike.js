import Model from './model.js';

export default class PhotoLike extends Model {
    constructor() {
        super();
        this.addField('UserId', 'string');
        this.addField('PhotoId', 'string');
        this.addField('UserAndPhotoId', 'string');
        this.setKey('UserAndPhotoId');
    }
}
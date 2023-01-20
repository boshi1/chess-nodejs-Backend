import {Player} from './interface';
import {Color} from './types';
class TablePlayer implements Player {
  Name: string;
  id: string;
  color: Color;
  constructor(Name: string, color: Color, id: string) {
    this.Name = Name;
    this.id = id;
    this.color = color;
  }
}
export {TablePlayer};

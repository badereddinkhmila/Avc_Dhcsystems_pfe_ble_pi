import noble from 'noble';
import { Observable } from 'rxjs';

export class bleHelpers{
    constructor(){
        this.connected_devs=[];
        this.hrate_observable=null;
        this.oxy_observable=null;
        this.weight_observable=null;
        this.temp_observable=null;
        this.gluc_observable=null;
    }

}
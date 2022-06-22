import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-policy',
    templateUrl: 'policy.component.html',
    styleUrls: ['policy.component.scss']
})
export class PolicyPage implements OnInit {
    appName: string = '';
    constructor(
    ) {}

    ngOnInit(): void {
        this.appName = environment.appName;
    }


}

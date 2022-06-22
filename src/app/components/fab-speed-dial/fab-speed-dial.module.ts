// https://github.com/Ecodev/fab-speed-dial
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
    FabSpeedDialActionsComponent,
    FabSpeedDialComponent,
    FabSpeedDialTriggerComponent,
} from './fab-speed-dial';

@NgModule({
    imports: [CommonModule],
    declarations: [FabSpeedDialActionsComponent, FabSpeedDialComponent, FabSpeedDialTriggerComponent],
    exports: [FabSpeedDialActionsComponent, FabSpeedDialComponent, FabSpeedDialTriggerComponent],
})
export class FabSpeedDialModule {}

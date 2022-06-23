import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { TranslateModule } from '@ngx-translate/core';
import { GameSettingDialogComponent, GameSettingIconComponent } from './setting';
@Component({
    selector: 'app-header',
    template: `
    <header class="title">
        <div class="title">
             <a href="/"><img src="/assets/icon/favicon.png"></a>
        </div>
        <div class="end">
            <span class="goto-games">
                <a href='/games'>
                    <mat-icon class="icon-controller" svgIcon="controller"></mat-icon>
                </a>
        </span>
            <game-setting></game-setting>
        </div>
    </header>
    `,
    styleUrls: ['header.scss']
})

export class HeaderComponent {

    constructor() { // , private router: Router

    }
}

@NgModule({
    declarations: [
        HeaderComponent,
        GameSettingDialogComponent,
        GameSettingIconComponent
    ],
    entryComponents: [
        GameSettingDialogComponent
    ],
    imports: [
        RouterModule,
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatFormFieldModule,
        MatSelectModule,
        TranslateModule
    ],
    exports: [ HeaderComponent ]
})
export class HeaderModule {}

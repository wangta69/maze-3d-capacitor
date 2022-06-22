import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { PolicyPage } from './pages/policy/policy.component';
import { GamesPage } from './pages/games/component';
const routes: Routes = [
    // { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '', component: GameComponent },
    { path: 'game', component: GameComponent },
    { path: 'policy', component: PolicyPage },
    { path: 'games', component: GamesPage }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

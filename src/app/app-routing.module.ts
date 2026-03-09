import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { HomeComponent } from './home/home.component';
import { CharacterDetailComponent } from './character-detail/character-detail.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { MemoryComponent } from './memory/memory.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'characters', component: HomeComponent },
  { path: 'character/:id', component: CharacterDetailComponent },
  { path: 'memory', component: MemoryComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
import {RenderMode,ServerRoute} from '@angular/ssr';
// Static output: the four real pages are prerendered at build time; unknown URLs fall back to the client-rendered shell so the 404 page shows correctly.
export const serverRoutes:ServerRoute[]=[
{path:'',renderMode:RenderMode.Prerender},
{path:'about-us',renderMode:RenderMode.Prerender},
{path:'services',renderMode:RenderMode.Prerender},
{path:'contact-us',renderMode:RenderMode.Prerender},
{path:'**',renderMode:RenderMode.Client}
];

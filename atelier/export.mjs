// Exports crativo.xyz into an Atelier site package (atelier.site/v1).
//
//   node atelier/export.mjs            → atelier/crativo.atelier.json
//   node atelier.mjs push <site> atelier/crativo.atelier.json --assets public
//
// Everything comes from this repository's own source: src/data (projects, about, contact), the apps
// list in src/app/apps/page.tsx, Markdown posts in content/blog (drafts in content/blog/drafts stay
// drafts) and images in public/. Image paths become "asset:" references that the Atelier CLI uploads.
// Needs `typescript` and `gray-matter` (both in package.json) — run `npm install` first.
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(join(root,'package.json'));
const ts=require('typescript'),matter=require('gray-matter');
const exists=p=>access(p).then(()=>true,()=>false);
const problems=[];

// Evaluates a TypeScript data module (type imports only) and returns its exports.
async function loadTs(file,source){const code=ts.transpileModule(source??await readFile(join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const module={exports:{}};new Function('module','exports','require',code)(module,module.exports,()=>({}));return module.exports}
async function asset(path){if(typeof path!=='string'||!path.startsWith('/'))return path||'';const clean=path.split(/[?#]/)[0];if(await exists(join(root,'public',clean)))return 'asset:'+clean.slice(1);problems.push(`Missing image ${path}`);return ''}
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,100);
const link=(label,href)=>({label:String(label).slice(0,300),href});

// ——— Projects ———
const {projects,categories:projectCategories}=await loadTs('src/data/projects.ts');
const projectEntries=[];
for(const [i,p] of projects.entries()){
 const links=(p.links??[]).map(l=>link(l.label,l.url)).filter(l=>/^https?:\/\//.test(l.href));
 if(p.href&&/^https?:\/\//.test(p.href)&&!links.some(l=>l.href===p.href))links.push(link(links.length?'Visit':'Visit site',p.href));
 const gallery=[];for(const v of p.previews??[])if(v.type!=='video'){const src=await asset(v.src);if(src)gallery.push({src,alt:String(v.alt||p.title).slice(0,300),caption:String(v.caption||'').slice(0,300)})}
 for(const g of p.gallery??[]){const src=await asset(g);if(src)gallery.push({src,alt:p.title,caption:''})}
 const data={summary:p.description,cover:await asset(p.imageUrl),category:p.category,year:p.year,stack:p.techStack,metrics:(p.metrics??[]).map(m=>({label:String(m.label),value:String(m.value)})),links,body:p.longDescription?.trim()||'',features:(p.features??[]).map(f=>({icon:f.icon||'',title:f.title,text:f.description||''})),...(p.codeSnippet?{code:{language:p.codeSnippet.language||'',filename:p.codeSnippet.filename||'',code:p.codeSnippet.code}}:{}),gallery};
 for(const k of Object.keys(data))if(data[k]===''||data[k]===undefined||(Array.isArray(data[k])&&!data[k].length))delete data[k];
 projectEntries.push({slug:slug(p.id),title:p.title,status:'published',date:null,position:i,data,...(p.protected&&p.password?{password:p.password}:{})});
}

// ——— Blog (published posts and drafts) ———
const blogLabels={tutorials:'Tutorials','deep-dives':'Deep Dives',tools:'Tools & Tips',career:'Career',thoughts:'Thoughts',devtools:'DevTools','hot-takes':'Hot Takes',performance:'Performance',engineering:'Engineering','data-engineering':'Data Engineering',projects:'Projects'};
async function posts(dir,status){const out=[];for(const file of (await readdir(join(root,dir))).filter(f=>f.endsWith('.md')).sort()){const {data:fm,content}=matter(await readFile(join(root,dir,file),'utf8'));const title=String(fm.title||file.replace(/\.md$/,''));
 // The page header shows the title, so a leading H1 that repeats it is dropped from the body.
 let body=content.replace(/^\s*#\s+(.+)\n+/,(m,h)=>h.trim().toLowerCase()===title.trim().toLowerCase()?'':m);
 const images=[...body.matchAll(/!\[([^\]]*)\]\((\/[^)\s]+)\)/g)];for(const [whole,alt,src] of images){const ref=await asset(src);body=body.replace(whole,ref?`![${alt}](${ref})`:`*${alt}*`)}
 const category=blogLabels[fm.category]||(fm.category?String(fm.category).replace(/(^|-)(\w)/g,(_,s,c)=>(s?' ':'')+c.toUpperCase()):'');
 const date=String(fm.publishedAt||fm.date||'').slice(0,10);
 const data={excerpt:String(fm.excerpt||'').slice(0,10000),cover:await asset(fm.coverImage),category,tags:(fm.tags??[]).map(String).slice(0,40),body:body.trim(),featured:fm.featured===true};
 for(const k of Object.keys(data))if(data[k]===''||(Array.isArray(data[k])&&!data[k].length))delete data[k];
 out.push({slug:slug(file.replace(/\.md$/,'')),title:title.slice(0,300),status,date:/^\d{4}-\d{2}-\d{2}$/.test(date)?date:null,position:0,data})}return out}
const blogEntries=[...await posts('content/blog','published'),...(await exists(join(root,'content/blog/drafts'))?await posts('content/blog/drafts','draft'):[])];
const seen=new Set();for(const e of blogEntries){while(seen.has(e.slug))e.slug+='-draft';seen.add(e.slug)}

// ——— Apps (the list lives inside src/app/apps/page.tsx) ———
const appsSource=await readFile(join(root,'src/app/apps/page.tsx'),'utf8');const appsLiteral=/const apps: App\[\] = (\[[\s\S]*?\n\]);/.exec(appsSource)?.[1];if(!appsLiteral)throw Error('Could not find the apps list in src/app/apps/page.tsx');
const {apps}=await loadTs('apps.ts',`exports.apps=${appsLiteral};`);
const appEntries=apps.map((a,i)=>{const command=a.platforms.find(p=>p.command)?.command;const data={tagline:a.tagline,icon:a.icon,description:a.description,platforms:a.platforms.filter(p=>p.url).map(p=>link(p.name,p.url)),...(command?{install:{language:'bash',filename:'',code:command}}:{}),stats:a.downloads?[{label:'Downloads',value:a.downloads}]:[],tags:a.tags,featured:a.featured===true};for(const k of Object.keys(data))if(Array.isArray(data[k])&&!data[k].length)delete data[k];return {slug:slug(a.name),title:a.name,status:'published',date:null,position:i,data}});

// ——— About and contact ———
const {aboutDataHuman,aboutDataHR}=await loadTs('src/data/about.ts');const {contactInfo}=await loadTs('src/data/contact.ts');
const tone={career:'accent2',achievement:'accent',education:'muted'};
const initials=name=>name.split(' ').map(w=>w[0]).join('').slice(0,3);
function aboutTab(id,data){const groups=[...new Set(data.skills.map(s=>s.category))].map(c=>({title:c,tags:data.skills.filter(s=>s.category===c).map(s=>s.name).join(', ')}));return [
 {type:'Profile',props:{id:id+'-profile',name:data.bio.name,initials:initials(data.bio.name),image:'',imageAlt:'',role:'',quote:data.bio.tagline.replace(/^"|"$/g,'')}},
 {type:'Heading',props:{id:id+'-about',eyebrow:'',text:'About Me',subtitle:'',level:'h2',align:'center'}},
 {type:'Markdown',props:{id:id+'-bio',body:data.bio.description.join('\n\n'),width:'prose'}},
 {type:'Heading',props:{id:id+'-skills',eyebrow:'',text:'Skills & Expertise',subtitle:'',level:'h2',align:'center'}},
 {type:'TagGroups',props:{id:id+'-skill-groups',align:'center',size:'large',groups}},
 {type:'Heading',props:{id:id+'-journey',eyebrow:'',text:'Journey',subtitle:'',level:'h2',align:'center'}},
 {type:'Timeline',props:{id:id+'-timeline',items:data.timeline.map(t=>({date:t.date,title:t.title,body:t.description,tone:tone[t.type]||'accent2'}))}},
]}

// ——— Pages ———
const section=(id,content,extra={})=>({type:'Section',props:{id,anchor:'',background:'none',width:'normal',padding:'medium',align:'left',content,...extra}});
const heading=(id,text,subtitle='',extra={})=>({type:'Heading',props:{id,eyebrow:'',text,subtitle,level:'h1',align:'center',...extra}});
const newsletter=id=>({type:'Newsletter',props:{id,title:'📬 Subscribe to the Newsletter',text:'New articles delivered to your inbox. No spam, unsubscribe anytime.',button:'Subscribe',placeholder:'you@example.com',note:'Join 500+ developers getting weekly insights on React, TypeScript, and building products.',newsletterList:'',fields:[{name:'email',label:'Email',type:'email',required:true}]}});
const doc=(title,description,content)=>({root:{props:{title,description}},content});
const pages=[
 {path:'/',title:'Projects',seo:{ogImage:''},doc:doc('Projects','Apps, tools, and libraries that solve real problems — by Jose Viscasillas, Senior Software Engineer.',[
  {type:'Hero',props:{id:'hero',eyebrow:'',title:'Built different.',subtitle:'Apps, tools, and libraries that solve real problems.',button:'',href:'',secondaryButton:'',secondaryHref:'',align:'center',size:'regular',image:'',imageAlt:''}},
  section('apps-banner',[{type:'Callout',props:{id:'apps-callout',icon:'🔥',title:'Looking for my 🔥 apps?',text:'CLI tools, npm packages & more — all free',linkLabel:'Browse Apps',href:'/apps',tokens:'pb, tb, ace, +4',tone:'surface'}}],{width:'narrow',padding:'none'}),
  section('work',[{type:'CollectionList',props:{id:'projects',collection:'projects',layout:'grid',columns:3,limit:48,sort:'position',featuredFirst:false,category:'',tag:'',showFilters:true,showSearch:false,paginate:false,showImage:true,showExcerpt:true,showTags:true,showMeta:true,showBadge:true,emptyMessage:'No projects in this category yet.'}}])])},
 {path:'/blog',title:'Blog',seo:{},doc:doc('Blog','Thoughts on code, tools, and engineering.',[
  section('blog-head',[heading('blog-title','Blog','Thoughts on code, tools, and engineering'),{type:'Buttons',props:{id:'rss',align:'center',items:[{label:'RSS Feed',href:'/blog/feed.xml',style:'link'}]}}],{padding:'small',align:'center'}),
  section('blog-signup',[newsletter('newsletter-top')],{width:'narrow',padding:'none'}),
  section('blog-list',[{type:'CollectionList',props:{id:'posts',collection:'blog',layout:'grid',columns:3,limit:24,sort:'default',featuredFirst:false,category:'',tag:'',showFilters:true,showSearch:true,paginate:true,showImage:true,showExcerpt:true,showTags:true,showMeta:true,showBadge:true,emptyMessage:'No posts match.'}}]),
  section('blog-signup-bottom',[newsletter('newsletter-bottom')],{width:'narrow'})])},
 {path:'/about',title:'About',seo:{},doc:doc('About','Who Jose Viscasillas is — the human version and the HR version.',[section('about',[{type:'Tabs',props:{id:'reader',firstLabel:'👋 Humans',secondLabel:'📋 Humans in HR',thirdLabel:'',first:aboutTab('human',aboutDataHuman),second:aboutTab('hr',aboutDataHR),third:[]}}],{width:'narrow',align:'center'})])},
 {path:'/contact',title:'Contact',seo:{},doc:doc('Contact','Get in touch with Jose. Send a message, grab coffee, or just say hi.',[section('contact',[
  {type:'Profile',props:{id:'contact-profile',name:'Jose Einstein Pants',initials:'JE',image:'',imageAlt:'',role:'Usually responds within a day',quote:'Unless he’s debugging Safari. Then who knows.'}},
  {type:'Markdown',props:{id:'contact-intro',body:"Hey! 👋 Thanks for stopping by.\n\nI'm always down to chat about projects, weird tech problems, or whether tabs or spaces is the hill worth dying on.\n\n*(It's spaces. But I'll tolerate your tab-based lifestyle.)*",width:'prose'}},
  {type:'Form',props:{id:'contact-form',title:'',text:'',button:'Send',layout:'stacked',fields:[{name:'name',label:'Name',type:'text',required:false},{name:'email',label:'Your email',type:'email',required:true},{name:'message',label:'Message',type:'textarea',required:true}]}},
  {type:'Heading',props:{id:'elsewhere',eyebrow:'',text:'Or find me elsewhere on the internet',subtitle:'',level:'h3',align:'center'}},
  {type:'ContactDetails',props:{id:'contact-links',items:[{label:'Email',value:contactInfo.email,href:'mailto:'+contactInfo.email},...contactInfo.socialLinks.map(s=>({label:s.platform,value:s.url.replace(/^https?:\/\/(www\.)?/,''),href:s.url})),...(contactInfo.calendarUrl?[{label:'Coffee chat',value:'Book a time',href:contactInfo.calendarUrl}]:[])]}}],{width:'narrow',align:'center'})])},
 {path:'/videos',title:'Videos',seo:{},doc:doc('Videos','Video tutorials, walkthroughs, and dev content.',[section('videos',[heading('videos-title','Videos','Tutorials, deep dives, and dev content. Coming soon.'),{type:'Callout',props:{id:'filming',icon:'🎬',title:'Filming in Progress',text:'Video content is on the way. Expect tutorials, project walkthroughs, and the occasional rant about CSS.',linkLabel:'',href:'',tokens:'',tone:'accent'}}],{width:'narrow',align:'center',padding:'large'})])},
 {path:'/apps',title:'Apps & Tools',seo:{},doc:doc('Apps & Tools','Free CLI tools, npm packages, and developer utilities by Jose Viscasillas. Install via npm, Homebrew, or download directly.',[section('apps-head',[heading('apps-title','Apps & Tools','Free CLI tools, npm packages, and developer utilities. Install via npm, Homebrew, or download directly.')],{padding:'small',align:'center'}),section('apps',[{type:'CollectionList',props:{id:'app-list',collection:'apps',layout:'grid',columns:3,limit:48,sort:'position',featuredFirst:true,category:'',tag:'',showFilters:false,showSearch:false,paginate:false,showImage:false,showExcerpt:true,showTags:true,showMeta:true,showBadge:false,emptyMessage:'Apps are on their way.'}}])])},
];

// ——— Collections ———
const entryShell=blocks=>({root:{props:{title:'',description:''}},content:[section('entry',blocks,{width:'narrow'})]});
const field=(key,label,type,extra={})=>({key,label,type,required:false,help:'',...extra});
const collections=[
 {key:'projects',name:'Projects',singular:'Project',route:'/projects',fields:[field('summary','Summary','textarea',{required:true}),field('cover','Cover image','image'),field('category','Category','select',{options:[...projectCategories.filter(c=>c!=='All'),'Experiments','Games']}),field('year','Year','number'),field('stack','Built with','tags'),field('metrics','Key figures','metrics'),field('links','Links','links'),field('body','Story','markdown'),field('features','Features','features'),field('code','Code snippet','code'),field('gallery','Previews','gallery'),field('featured','Featured','boolean')],settings:{sort:'position',perPage:48,card:{image:'cover',excerpt:'summary',category:'category',tags:'stack',meta:'metrics',badge:'year',year:'year'},feed:false,comments:'open',allLabel:'All'},
  template:entryShell([{type:'EntryHeader',props:{id:'header',showCover:true,showDate:false,showCategory:true,showReadingTime:false,showTags:false,backLabel:'Back',align:'left'}},{type:'EntryField',props:{id:'links',field:'links',display:'auto',title:''}},{type:'EntryField',props:{id:'previews',field:'gallery',display:'auto',title:''}},{type:'EntryBody',props:{id:'story',field:'body',collapsible:true,width:'prose'}},{type:'EntryField',props:{id:'stack',field:'stack',display:'auto',title:'Built With'}},{type:'EntryField',props:{id:'features',field:'features',display:'auto',title:'Features'}},{type:'EntryField',props:{id:'impact',field:'metrics',display:'auto',title:'Impact'}},{type:'EntryField',props:{id:'code',field:'code',display:'auto',title:'Under the Hood'}},{type:'EntryPager',props:{id:'pager'}},{type:'Comments',props:{id:'discussion',title:'Discussion',note:'💬 Be nice, or be funny. Preferably both.'}}]),entries:projectEntries},
 {key:'blog',name:'Blog',singular:'Post',route:'/blog',fields:[field('excerpt','Excerpt','textarea'),field('cover','Cover image','image'),field('category','Category','select',{options:[...new Set([...Object.values(blogLabels),...blogEntries.map(e=>e.data.category).filter(Boolean)])]}),field('tags','Tags','tags'),field('body','Article','markdown',{required:true}),field('featured','Featured','boolean')],settings:{sort:'newest',perPage:24,card:{image:'cover',excerpt:'excerpt',category:'category',tags:'tags',badge:'date'},feed:true,comments:'open',allLabel:'All'},
  template:entryShell([{type:'EntryHeader',props:{id:'header',showCover:true,showDate:true,showCategory:true,showReadingTime:true,showTags:true,backLabel:'All posts',align:'left'}},{type:'EntryBody',props:{id:'article',field:'body',collapsible:false,width:'prose'}},{type:'Callout',props:{id:'author',icon:'✍️',title:'Written by Jose Viscasillas',text:'Senior Software Engineer. Builds things because he genuinely loves it.',linkLabel:'About',href:'/about',tokens:'',tone:'surface'}},{type:'RelatedEntries',props:{id:'recommended',title:'Recommended reads',limit:3,by:'category'}},newsletter('post-newsletter'),{type:'Comments',props:{id:'comments',title:'Discussion',note:'Be nice, or be funny. Preferably both.'}}]),entries:blogEntries},
 {key:'apps',name:'Apps',singular:'App',route:'/apps',fields:[field('tagline','Tagline','text'),field('icon','Icon (emoji)','text'),field('description','Description','textarea'),field('platforms','Install / download','links'),field('install','Install command','code'),field('stats','Stats','metrics'),field('tags','Tags','tags'),field('featured','Featured','boolean')],settings:{sort:'position',perPage:48,card:{excerpt:'description',tags:'tags',meta:'stats',badge:'none'},feed:false,comments:'off',allLabel:'All'},
  template:entryShell([{type:'EntryHeader',props:{id:'header',showCover:false,showDate:false,showCategory:false,showReadingTime:false,showTags:true,backLabel:'All apps',align:'left'}},{type:'EntryField',props:{id:'tagline',field:'tagline',display:'text',title:''}},{type:'EntryField',props:{id:'about',field:'description',display:'auto',title:''}},{type:'EntryField',props:{id:'install',field:'install',display:'auto',title:'Install'}},{type:'EntryField',props:{id:'platforms',field:'platforms',display:'auto',title:'Get it'}},{type:'EntryField',props:{id:'stats',field:'stats',display:'auto',title:''}}]),entries:appEntries},
];
// The apps listing page at /apps is the collection route itself; entry pages live at /apps/<name>.

const pkg={format:'atelier.site/v1',exportedAt:new Date().toISOString(),source:'crativo.xyz',
 site:{name:'crativo.xyz',
  theme:{preset:'noir',background:'#0a0a0a',text:'#ededed',muted:'#a1a1aa',accent:'#facc15',accent2:'#10b981',surface:'#141414',border:'#262626',fontHeading:'times',fontBody:'times',radius:12,spacing:64,width:1120,pattern:'dots',buttonStyle:'pill',headerStyle:'bar',dark:true},
  settings:{brand:{name:'crativo',accent:'.xyz',logo:'',tagline:''},nav:{links:[link('Projects','/'),link('Blog','/blog'),link('Videos','/videos'),link('About','/about'),link('Contact','/contact')]},footer:{text:'Built by jose · © 2026 crativo.xyz',links:[link('Apps','/apps'),link('RSS','/blog/feed.xml')],social:contactInfo.socialLinks.map(s=>link(s.platform,s.url)),badge:true},seo:{titleTemplate:'%s | Jose Viscasillas',description:'Jose Viscasillas is a Senior Software Engineer with 21 years of experience specializing in React, TypeScript, video platforms, and developer tools.',ogImage:await asset('/og-image.png'),twitter:'@crativo',noIndex:false},identity:{type:'Person',name:'Jose Viscasillas',jobTitle:'Senior Software Engineer',url:'https://crativo.xyz',email:contactInfo.email,sameAs:['https://github.com/josmanvis','https://twitter.com/crativo','https://linkedin.com/in/joseviscasillas']},floating:{label:'Say hi',href:'/contact',icon:'💬'},favicon:await asset('/icon.png'),lang:'en'}},
 pages,collections,redirects:{'/projects':'/'}};
const out=join(root,'atelier','crativo.atelier.json');await writeFile(out,JSON.stringify(pkg,null,1)+'\n');
console.log(`Wrote ${out}\n  pages ${pages.length} · projects ${projectEntries.length} (${projectEntries.filter(e=>e.password).length} protected) · posts ${blogEntries.filter(e=>e.status==='published').length} published, ${blogEntries.filter(e=>e.status==='draft').length} drafts · apps ${appEntries.length}`);
if(problems.length)console.log(`  ${problems.length} note(s):\n  - ${[...new Set(problems)].join('\n  - ')}`);

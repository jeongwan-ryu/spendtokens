export const WINDOW_SIZE=500;
export function pageSlice(entries,page=0,size=WINDOW_SIZE){const pages=Math.max(1,Math.ceil(entries.length/size)),current=Math.min(pages-1,Math.max(0,page));return {entries:entries.slice(current*size,(current+1)*size),page:current,pages,total:entries.length};}
export function pageForLine(entries,line,size=WINDOW_SIZE){const index=entries.findIndex(e=>e.line===line);return index<0?-1:Math.floor(index/size);}

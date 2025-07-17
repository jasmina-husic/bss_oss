const LS="bss_categories";
let cache=null;
function save(){ localStorage.setItem(LS, JSON.stringify(cache)); }
export async function fetchCategories(){
  if(cache) return [...cache];
  const stored=localStorage.getItem(LS);
  cache=stored?JSON.parse(stored):["surveillance","networking","ai","itsm"];
  return [...cache];
}
export async function addCategory(cat){
  await fetchCategories();
  if(!cache.includes(cat)){ cache.push(cat); save(); }
}
export async function deleteCategory(idx){
  await fetchCategories(); cache.splice(idx,1); save();
}

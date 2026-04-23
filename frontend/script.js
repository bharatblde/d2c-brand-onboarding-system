const API = "http://localhost:5000/api";

function msg(id,text,error=false){
 document.getElementById(id).innerHTML =
 `<div class="${error?"error-msg":"success-msg"}">${text}</div>`;
}

// CLEAR FILTER
function clearFilters(){
 filterStatus.value = "";
 filterCategory.value = "";
 getBrands();
}

// CREATE
async function createBrand(){

 let errors = [];

 if(!brand_name.value.trim()){
  errors.push("Brand Name is required");
 }

 if(!founder_name.value.trim()){
  errors.push("Founder Name is required");
 }

 if(!category.value.trim()){
  errors.push("Category is required");
 }

 if(Number(monthly_revenue.value) < 0){
  errors.push("Revenue must be ≥ 0");
 }

 if(errors.length){
  return msg("createMsg", errors.join("<br>"), true);
 }

 let res = await fetch(`${API}/brands`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
    brand_name:brand_name.value,
    founder_name:founder_name.value,
    category:category.value,
    monthly_revenue:Number(monthly_revenue.value)||0,
    website:website.value
  })
 });

 let d = await res.json();

 if(!res.ok){
  return msg("createMsg", d.error || "Error creating brand", true);
 }

 msg("createMsg","Brand Created");

 // CLEAR FORM (NEW)
 brand_name.value="";
 founder_name.value="";
 category.value="";
 monthly_revenue.value="";
 website.value="";

 getBrands();
 getSummary();
}

// LIST
async function getBrands(){

 brands.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

 let url = `${API}/brands`;

 if(filterStatus.value){
   url += `?status=${filterStatus.value}`;
 }
 else if(filterCategory.value.trim()){
   url += `?category=${filterCategory.value.trim()}`;
 }

 try{
   let res = await fetch(url);
   let data = await res.json();

   brands.innerHTML = data.map(b=>`
<tr onclick="fill('${b.id || b._id}')">

<td>${b.id || b._id}</td>
<td>${b.brand_name}</td>
<td>${b.founder_name}</td>
<td>${b.category}</td>
<td>${b.monthly_revenue}</td>

<td>
<span class="status ${b.status}">
${b.status}
</span>
</td>

<td>
${
(b.created_at || b.createdAt)
? new Date(b.created_at || b.createdAt).toLocaleString()
: "N/A"
}
</td>

</tr>
`).join("");

 }catch(err){
   msg("createMsg", err.message, true);
 }
}

// SELECT
function fill(id){
 document.getElementById("brandId").value = id;
 document.getElementById("noteBrandId").value = id;
 document.getElementById("singleId").value = id;
}

// SINGLE
async function getSingleBrand(){

 const id = document.getElementById("singleId").value;

 if(!id){
  return msg("singleMsg","Enter or select brand ID",true);
 }

 let res = await fetch(`${API}/brands/${id}`);
 let d = await res.json();

 if(!res.ok){
  return msg("singleMsg",d.error,true);
 }

 brandDetails.innerHTML = `
<p><b>ID:</b> ${d.id || d._id}</p>
<p><b>Name:</b> ${d.brand_name}</p>
<p><b>Founder:</b> ${d.founder_name}</p>
<p><b>Category:</b> ${d.category}</p>
<p><b>Revenue:</b> ₹${d.monthly_revenue}</p>
<p><b>Status:</b> ${d.status}</p>
<p><b>Created At:</b> ${
 (d.created_at || d.createdAt)
 ? new Date(d.created_at || d.createdAt).toLocaleString()
 : "N/A"
}</p>
<hr>
<h4>Notes:</h4>
${
 d.notes && d.notes.length
 ? d.notes.map(n=>`
   <div style="margin-bottom:10px">
     ${n.note}<br>
     <small>${new Date(n.created_at).toLocaleString()}</small>
   </div>
 `).join("")
 : "<p>No notes available</p>"
}
`;
}

// STATUS
async function updateStatus(){

 const id = document.getElementById("brandId").value;
 const stat = document.getElementById("status").value;

 if(!id){
  return msg("statusMsg","Select brand first",true);
 }

 if(stat === ""){
  return msg("statusMsg","Status is required",true);
 }

 let res = await fetch(`${API}/brands/${id}/status`,{
  method:"PATCH",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({status:stat})
 });

 let d = await res.json();

 if(!res.ok){
  return msg("statusMsg",d.error,true);
 }

 msg("statusMsg","Status Updated");
 getBrands();
 getSummary();
}

// NOTE
async function addNote(){

 const id = document.getElementById("noteBrandId").value;
 const note = document.getElementById("noteText").value;

 if(!id){
  return msg("noteMsg","Select brand first",true);
 }

 if(!note.trim()){
  return msg("noteMsg","Note cannot be empty",true);
 }

 let res = await fetch(`${API}/brands/${id}/notes`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({note})
 });

 let d = await res.json();

 if(!res.ok){
  return msg("noteMsg",d.error,true);
 }

 msg("noteMsg","Note Added");
 noteText.value="";
 getSingleBrand();
}

// SUMMARY
async function getSummary(){
 let res=await fetch(`${API}/brands/summary`);
 let d=await res.json();

 total.innerText=d.total;
 submitted.innerText=d.submitted;
 review.innerText=d.under_review;
 shortlisted.innerText=d.shortlisted;
 accepted.innerText=d.accepted;
 rejected.innerText=d.rejected;
}

// AUTO
getBrands();
getSummary();

// FILTER INDEPENDENCE
const fs = document.getElementById("filterStatus");
const fc = document.getElementById("filterCategory");

if(fs && fc){
 fs.addEventListener("change", () => fc.value = "");
 fc.addEventListener("input", () => fs.value = "");
}
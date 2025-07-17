import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchOrders, searchOrders } from "../services/orderService";
import DataTable from "../components/DataTable";

const STAGES=[ "prospect","negotiation","contract","activation","delivery","closed" ];

export default function Orders(){
  const [orders,setOrders]=useState([]);
  const [filterStage,setFilterStage]=useState("");
  const [q,setQ]=useState("");
  const nav=useNavigate();

  async function loadAll(){ setOrders(await fetchOrders()); }
  useEffect(()=>{ loadAll(); },[]);

  const handleSearch=async(e)=>{
    const term=e.target.value; setQ(term);
    term? setOrders(await searchOrders(term)) : loadAll();
    setFilterStage("");
  };

  const columns=[
    { header:"ID", accessorKey:"id", cell:({row})=>
        <Link to={`/orders/${row.original.id}`} className="text-blue-600 text-xs">#{row.original.id}</Link> },
    { header:"Contract", accessorKey:"contractNumber"},
    { header:"Customer", accessorKey:"customerId"},
    { header:"Offering", accessorKey:"offeringId"},
    { header:"Stage", accessorKey:"stage"},
    { header:"Created", accessorKey:"createdAt"}
  ];

  const data = filterStage ? orders.filter(o=>o.stage===filterStage) : orders;

  return(
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Orders</h1>
        <button onClick={()=>nav("/orders/new")}
          className="px-3 py-1 bg-black text-white rounded text-xs">+ New Order</button>
      </div>

      <input value={q} onChange={handleSearch} placeholder="Search order / contract"
        className="border rounded p-2 w-full mb-4"/>

      <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {STAGES.map(s=>{
          const cnt=orders.filter(o=>o.stage===s).length;
          return (
            <button key={s} onClick={()=>setFilterStage(s===filterStage?"":s)}
              className={`border rounded p-2 text-sm capitalize ${filterStage===s?"bg-black text-white":"bg-gray-50"}`}>
              {s} ({cnt})
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={data}
        rowCount={data.length}
        state={{pagination:{pageIndex:0,pageSize:data.length},sorting:[],globalFilter:""}}
        onStateChange={()=>{}}
      />
    </div>
  );
}

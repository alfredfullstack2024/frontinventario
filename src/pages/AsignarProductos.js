import { useState , useEffect } from "react" ;   
import api from "../services/api" ;   
import BarcodeScanner from "../components/BarcodeScanner" ;   

export default function AsignarProductos ( ) {    
  const [ scanning , setScanning ] = useState ( false ) ;   
  const [ categorías , setCategorias ] = useState ( [ ] ) ;   
  const [ codigoActual , setCodigoActual ] = useState ( null ) ;   
  const [ codigoManual , setCodigoManual ] = useState ( "" ) ;   
  const [ sugerencias , setSugerencias ] = useState ( [ ] ) ;   
  const [ error , setError ] = useState ( "" ) ;   
  const [ exito , setExito ] = useState ( "" ) ;   

  // Datos del producto
  const [ nombre , setNombre ] = useState ( "" ) ;   
  const [ descripcion , setDescripcion ] = useState ( "" ) ;   
  const [ precio , setPrecio ] = useState ( "" ) ;   
  const [ categoria , setCategoria ] = useState ( "" ) ;   
  const [ ubicacion , setUbicacion ] = useState ( "" ) ;   
  const [ stock , setStock ] = useState ( 1 ) ;   
  const [ referencia , setReferencia ] = useState ( "" ) ;   
  const [ presentacion , setPresentación ] = useState ( "" ) ;   
  const [ marcaFabricante , setMarcaFabricante ] = useState ( "" ) ;   
  const [ registroInvima , setRegistroInvima ] = useState ( "" ) ;   
  const [ clasificacionRiesgo , setClasificacionRiesgo ] = useState ( "" ) ;   

  const [ cantidadMinimaMensual , setCantidadMinimaMensual ] = useState ( "" ) ;   
  const [ cantidadMaximaMensual , setCantidadMaximaMensual ] = useState ( "" ) ;   

  const [ numeroLote , setNumeroLote ] = useState ( " " ) ;   
  const [ fechaVencimiento , setFechaVencimiento ] = useState ( "" ) ;   
  const [ numeroRemisionFactura , setNumeroRemisionFactura ] = useState ( "" ) ;   

  useEffect ( ( ) => {  
    cargarCategorías ( ) ;
  } , [ ] ) ; 

  const cargarCategorias = async ( ) => {      
    intentar { 
      const res = await api . get ( "/categorias" ) ; 
      setCategorias ( res . data ) ;
    } catch ( error ) {   
      consola . error ( "Error al cargar categorías:" , error ) ;
    }
  } ;

  const buscarCodigo = async ( codigo ) => { buscarCodigo      
  intentar { 
    setError ( "" ) ;
    setExito ( "" ) ;

frontinventario – Descripción general del despliegue – Vercel
16:05:50

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'

function Perfil() {
  const [perfil, setPerfil] = useState(null)
  const [imagenes, setImagenes] = useState([])
  const [nuevaUrl, setNuevaUrl] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return navigate('/login')
      
      const { data } = await supabase.from('usuario').select('*').eq('id', user.id).single()
      setPerfil(data)
      cargarImagenes(user.id)
    }
    cargar()
  }, [navigate])

  const cargarImagenes = async (usuarioId) => {
    const { data } = await supabase.from('multimedia').select('*').eq('usuario_id', usuarioId).order('creado_en', { ascending: false })
    setImagenes(data ?? [])
  }

  const handleChange = (e) => setPerfil({ ...perfil, [e.target.name]: e.target.value })

  const guardar = async () => {
    const { error } = await supabase.from('usuario').update({
      nombre: perfil.nombre,
      fecha_nacimiento: perfil.fecha_nacimiento,
      telefono: perfil.telefono,
    }).eq('id', perfil.id)
    alert(error ? 'No se pudo guardar' : 'Datos actualizados')
  }

  const agregarImagen = async () => {
    if (!nuevaUrl.trim()) return
    const { error } = await supabase.from('multimedia').insert({ url: nuevaUrl, usuario_id: perfil.id })
    if (!error) {
      setNuevaUrl('')
      cargarImagenes(perfil.id)
    }
  }

  const borrarImagen = async (id) => {
    const { error } = await supabase.from('multimedia').delete().eq('id', id)
    if (!error) setImagenes(imagenes.filter((img) => img.id !== id))
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (!perfil) return <div className="container py-4">Cargando...</div>

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Hola, {perfil.nombre}</h2>
        <div className="d-flex gap-2">
          {perfil.rol === 'admin' && (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Ir al dashboard</button>
          )}
          <button className="btn btn-outline-secondary" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </div>
      <div className="card mb-4 shadow-sm">
        <div className="card-body row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input className="form-control" name="nombre" value={perfil.nombre} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Correo</label>
            <input className="form-control" value={perfil.correo} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label">Fecha de nacimiento</label>
            <input className="form-control" type="date" name="fecha_nacimiento" value={perfil.fecha_nacimiento ?? ''} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input className="form-control" name="telefono" value={perfil.telefono ?? ''} onChange={handleChange} />
          </div>
          <div className="col-12">
            <button className="btn btn-success" onClick={guardar}>Guardar cambios</button>
          </div>
        </div>
      </div>
      <h3 className="h5">Mis imágenes</h3>
      <div className="input-group mb-3 shadow-sm">
        <input className="form-control" placeholder="URL de la imagen (ej: https://ejemplo.com/foto.jpg)" value={nuevaUrl} onChange={(e) => setNuevaUrl(e.target.value)} />
        <button className="btn btn-primary" onClick={agregarImagen}>Agregar</button>
      </div>
      <div className="row row-cols-2 row-cols-md-4 g-3">
        {imagenes.map((img) => (
          <div className="col" key={img.id}>
            <div className="card h-100 shadow-sm">
              <img src={img.url} className="card-img-top object-fit-cover" style={{height: '150px'}} alt="Usuario" />
              <div className="card-body p-2">
                <button className="btn btn-sm btn-outline-danger w-100" onClick={() => borrarImagen(img.id)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Perfil
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'

function Dashboard() {
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function verificaryCargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return navigate('/login')
      
      const { data: yo } = await supabase.from('usuario').select('rol').eq('id', user.id).single()
      if (yo?.rol !== 'admin') {
        navigate('/perfil')
        return
      }
      await cargarDatos()
      setCargando(false)
    }
    verificaryCargar()
  }, [navigate])

  const cargarDatos = async () => {
    const { data, error } = await supabase
      .from('usuario')
      .select('id, nombre, correo, telefono, rol, creado_en, multimedia(id, url)')
      .order('creado_en', { ascending: false })
    if (!error) setUsuarios(data)
  }

  const totalImagenes = usuarios.reduce((s, u) => s + (u.multimedia?.length || 0), 0)
  const admins = usuarios.filter((u) => u.rol === 'admin').length
  const haceUnaSemana = Date.now() - 7 * 24 * 60 * 60 * 1000
  const nuevos = usuarios.filter((u) => new Date(u.creado_en) > haceUnaSemana).length
  const maxImagenes = Math.max(1, ...usuarios.map((u) => u.multimedia?.length || 0))

  const indicadores = [
    ['Usuarios', usuarios.length],
    ['Administradores', admins],
    ['Total Imágenes', totalImagenes],
    ['Nuevos (7 días)', nuevos],
  ]

  const filtrados = usuarios.filter((u) =>
    `${u.nombre} ${u.correo}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const cambiarCampo = (id, campo, valor) => setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, [campo]: valor } : u)))

  const guardar = async (u) => {
    const { error } = await supabase.from('usuario').update({ nombre: u.nombre, telefono: u.telefono }).eq('id', u.id)
    alert(error ? 'No se pudo guardar' : `Guardado: ${u.nombre}`)
  }

  const borrarImagen = async (imagenId) => {
    if(!window.confirm("¿Seguro que deseas borrar esta imagen?")) return;
    const { error } = await supabase.from('multimedia').delete().eq('id', imagenId)
    if (!error) cargarDatos()
  }

  if (cargando) return <div className="container py-4">Cargando dashboard...</div>

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Panel de Administración</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/perfil')}>Volver a mi perfil</button>
      </div>
      
      <div className="row g-3 mb-4">
        {indicadores.map(([titulo, valor]) => (
          <div className="col-6 col-md-3" key={titulo}>
            <div className="card text-center h-100 shadow-sm">
              <div className="card-body">
                <div className="text-muted small">{titulo}</div>
                <div className="fs-2 fw-bold text-primary">{valor}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h2 className="h5 mb-3">Imágenes subidas por usuario</h2>
          {usuarios.map((u) => (
            <div className="d-flex align-items-center gap-2 mb-2" key={u.id}>
              <span className="w-25 text-truncate small">{u.nombre}</span>
              <div className="progress flex-grow-1" style={{ height: '20px' }}>
                <div className="progress-bar bg-info" style={{ width: `${((u.multimedia?.length || 0) / maxImagenes) * 100}%` }}>
                  {u.multimedia?.length || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h2 className="h5 mb-0">Gestión de Usuarios</h2>
            <input className="form-control w-auto" placeholder="Buscar usuario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Imágenes</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <input className="form-control form-control-sm" value={u.nombre} onChange={(e) => cambiarCampo(u.id, 'nombre', e.target.value)} />
                    </td>
                    <td>{u.correo}</td>
                    <td>
                      <input className="form-control form-control-sm" value={u.telefono ?? ''} onChange={(e) => cambiarCampo(u.id, 'telefono', e.target.value)} />
                    </td>
                    <td>
                      <span className={`badge ${u.rol === 'admin' ? 'text-bg-warning' : 'text-bg-secondary'}`}>{u.rol}</span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {u.multimedia?.map((img) => (
                          <img key={img.id} src={img.url} alt="" width="35" height="35" title="Clic para borrar" className="rounded object-fit-cover cursor-pointer border border-danger" style={{cursor: 'pointer'}} onClick={() => borrarImagen(img.id)} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => guardar(u)}>Guardar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
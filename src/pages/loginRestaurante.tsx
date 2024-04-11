import { useState } from 'react'
import styles from '../assets/styleLogin.module.css'
import { RestauranteService } from '../services/RestauranteService';

const LoginNegocio = () => {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [telefono, setTelefono] = useState(0);

  const handleIniciarSesionNegocio = () => {
    RestauranteService.getRestaurant(email, contraseña);
  };

  const handleCargarNegocio = () => {
    RestauranteService.createRestaurant(email, contraseña, domicilio, telefono);
  };

  return (
    <div>
      <div className={styles.containerForm}>
        <div className={styles.info}>
          <div className={styles.infoChilds}>
            <h2>¡Bienvenido!</h2>
            <p>Si ya posees una cuenta, por favor, inicia sesión con tus datos</p>
            <input type="button" value="Iniciar sesión" id="iniciarSesionDatos" />
          </div>
        </div>
        <div className={styles.formInfo}>
          <div>
            <h2>Crear una cuenta</h2>
            <div>
              <form>
                <input
                  type="email"
                  name="email"  
                  onChange={(e) => { setEmail(e.target.value) }}
                  required
                  placeholder="Correo electrónico"
                />
                <input
                  type="password"
                  name="contraseña"

                  onChange={(e) => { setContraseña(e.target.value) }}
                  required
                  placeholder="Contraseña"
                />
                <input
                  type="text"
                  name="domicilio"
                  onChange={(e) => { setDomicilio(e.target.value) }}
                  required
                  placeholder="Domicilio"
                />
                <input
                  type="number"
                  name="telefono"
      
                  onChange={(e) => { setTelefono(parseInt(e.target.value)) }}
                  required
                  placeholder="Telefono"
                />
                <button type="button" onClick={handleCargarNegocio}>Registrarse</button>
              </form>
            </div>
          </div>
        </div>
        <div className={styles.containerForm}>
          <div className={styles.info}>
            <div className={styles.infoChilds}>
              <h2>¡Bienvenido!</h2>
              <p>Si no posees una cuenta de negocio, por favor, registrate aquí</p>
              <input type="button" value="Registrarse" id="registrarDatos" />
            </div>
          </div>
          <div className={styles.formInfo}>
            <div>
              <h2>Iniciar sesión</h2>
              <form className={styles.form}>
                <label>
                  <input required type="text" placeholder="Correo electrónico" id="emailLogin"
                    onChange={(e) => { setEmail(e.target.value) }} />
                </label>
                <label>
                  <input required type="password" placeholder="Contraseña" id="contraseñaLogin"
                    onChange={(e) => { setContraseña(e.target.value) }} />
                </label>
                <input type="button" onClick={handleIniciarSesionNegocio} />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginNegocio

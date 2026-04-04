import logo from '../assets/CRS.png';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faComment, faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from '../AuthProvider';

const NavBar = ({ state }) => {
  const location = useLocation();
  const { handleLogout } = useAuth();
  const getClass = (paths) =>
    paths.includes(location.pathname)
      ? 'nav-link active text-white py-lg-4'
      : 'nav-link text-white py-lg-4'
  return (
    <nav className="navbar navbar-expand p-0 position-absolute w-100">
      <div className="container-fluid h-100">
        <img src={logo} alt='CRS' width={50} className='py-lg-2' />
        {state ?
          <>
            <ul className="navbar-nav me-auto mb-lg-0 ms-lg-3 fw-bold fs-5">
              <li className="nav-item">
                <Link to="#" className={getClass([])}>Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/" className={getClass(["/"])}>Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/courses" className={getClass(["/courses", "/enrollments"])}>Courses</Link>
              </li>
            </ul>
            <div className="d-flex justify-content-evenly icons">
              <FontAwesomeIcon icon={faBell} size='2xl' color='white' />
              <FontAwesomeIcon icon={faComment} size='2xl' color='white' />
              <div className='dropstart'>
                <FontAwesomeIcon
                  icon={faCircleUser}
                  size='2xl'
                  color='white'
                  role='button'
                  onClick={() => {
                    const list = window.document.getElementById('user-options');
                    list.style.display = list.style.display === 'block' ? 'none' : 'block';
                  }}
                />
                <ul className='dropdown-menu end-0' id='user-options'>
                  <li><button
                    className="dropdown-item"
                    onClick={() => handleLogout()}
                  >
                    Logout
                  </button></li>
                </ul>
              </div>
            </div>
          </>
          : <></>}
      </div>
    </nav>
  );
};

export default NavBar
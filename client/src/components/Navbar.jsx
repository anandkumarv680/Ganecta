import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  Button
} from 'react-bootstrap'

const Navbar = () => {
  return (
    <BootstrapNavbar expand="lg" bg="dark" variant="dark">
      <Container>
        <BootstrapNavbar.Brand href="/">
          Ganecta
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/explore">Explore</Nav.Link>
            <Nav.Link href="/challenges">Challenges</Nav.Link>
          </Nav>

          <div className="d-flex gap-2 ms-lg-3">
            <Button variant="outline-light">Login</Button>
            <Button variant="primary">Sign Up</Button>
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar
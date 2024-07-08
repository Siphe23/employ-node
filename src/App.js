import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const employeeDefault = '';

  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    employeeId: '',
    gender: '',
    image: employeeDefault,
    editMode: false,
    editIndex: -1,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/employees')
      .then(response => response.json())
      .then(data => setEmployees(data))
      .catch(error => console.error('Error fetching employees:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.editMode) {
      const updatedEmployees = [...employees];
      updatedEmployees[formData.editIndex] = formData;
      setEmployees(updatedEmployees);
    } else {
      setEmployees([...employees, formData]);
    }

    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      employeeId: '',
      gender: '',
      image: employeeDefault,
      editMode: false,
      editIndex: -1,
    });
  };

  const deleteEmployee = (index) => {
    const updatedEmployees = employees.filter((_, i) => i !== index);
    setEmployees(updatedEmployees);
  };

  const editEmployee = (index) => {
    const employeeToEdit = employees[index];
    setFormData({
      ...employeeToEdit,
      editMode: true,
      editIndex: index,
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      // If search term is empty, fetch all employees
      fetch('http://localhost:5000/employees')
        .then(response => response.json())
        .then(data => setEmployees(data))
        .catch(error => console.error('Error fetching employees:', error));
    } else {
      // Filter employees based on search term
      const filteredEmployees = employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setEmployees(filteredEmployees);
    }
  };

  const resetSearch = () => {
    setSearchTerm('');
    // Reset to fetch all employees
    fetch('http://localhost:5000/employees')
      .then(response => response.json())
      .then(data => setEmployees(data))
      .catch(error => console.error('Error fetching employees:', error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="employee-form">
          <h2>{formData.editMode ? 'Edit Employee' : 'Add Employee'}</h2>
          <form onSubmit={handleSubmit}>
            <label>Name:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />

            <label>Email Address:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />

            <label>Phone Number:</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
            
            <label>ID:</label>
            <input type="text" id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleInputChange} required />

            <div className="gender-container">
              <label>Gender:</label>
              <div className="radio-wrapper">
                <input type="radio" id="female" name="gender" value="female" onChange={handleInputChange} required />
                <label htmlFor="female">Female</label>
              </div>

              <div className="radio-wrapper">
                <input type="radio" id="male" name="gender" value="male" onChange={handleInputChange} required />
                <label htmlFor="male">Male</label>
              </div>
            </div>

            <fieldset>
              <legend><b>Position:</b></legend>
              <select id="position" name="position" value={formData.position} onChange={handleInputChange}>
                <option value="">Choose position:</option>
                <option value="Technician">IT technician</option>
                <option value="Specialist">Support specialist</option>
                <option value="Tester">Quality assurance tester</option>
                <option value="WebDev">Web developer</option>
              </select>
            </fieldset>
          
            <label>Image:</label> 
            <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
            {formData.image && <img src={formData.image} alt="Employee" className="image-preview" />}

            <button type="submit">{formData.editMode ? 'Update Employee' : 'Add Employee'}</button>
          </form>
        </div>

        <div className="employee-list">
          <h2>Employee List</h2>
          <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearchChange} />
          <button onClick={handleSearch}>Search</button>
          <button onClick={resetSearch}>Reset</button>
          <ul>
            {employees.map((employee, index) => (
              <li key={index}>
                <div>
                  <label className="label">Name:</label> {employee.name}<br />
                  <label className="label">Email:</label> {employee.email}<br />
                  <label className="label">Phone:</label> {employee.phone}<br />
                  <label className="label">Position:</label> {employee.position}<br />
                  <label className="label">ID:</label> {employee.employeeId}<br />
                  <label className="label">Gender:</label> {employee.gender}<br />
                  <img src={employee.image} alt="Employee" className="employee-image" />
                </div>
                <button onClick={() => editEmployee(index)}>Edit</button>
                <button onClick={() => deleteEmployee(index)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const employeeDefault = null; // Default image value can be null

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

  // Fetch employees from the server on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch all employees from the server
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };



  // Handle form submission for adding or updating an employee
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = formData.editMode
      ? `http://localhost:5000/employees/${formData.employeeId}` // For editing
      : `http://localhost:5000/employees`; // For adding

    const method = formData.editMode ? 'PUT' : 'POST'; // Determine HTTP method (PUT for edit, POST for add)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Send form data as JSON
      });

      if (response.ok) {
        const updatedEmployee = await response.json();

        if (formData.editMode) {
          const updatedEmployees = employees.map((emp) =>
            emp.id === updatedEmployee.id ? updatedEmployee : emp
          );
          setEmployees(updatedEmployees); // Update the employee list with the edited employee
        } else {
          setEmployees([...employees, updatedEmployee]); // Add new employee to the list
        }

        resetForm();
      } else {
        console.error('Failed to save employee');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  // Delete an employee
  const deleteEmployee = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/employees/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedEmployees = employees.filter((employee) => employee.id !== id);
        setEmployees(updatedEmployees); // Remove deleted employee from the list
      } else {
        console.error('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
  
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
  
      // Send the image to your Node.js backend for storage
      fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.imageUrl) {
            setFormData({
              ...formData,
              image: data.imageUrl, // Store the image URL in the form data
            });
          }
        })
        .catch((error) => {
          console.error('Error uploading image:', error);
        });
    }
  };
  
  
  // Edit an existing employee
  const editEmployee = (index) => {
    const employeeToEdit = employees[index];
    setFormData({
      ...employeeToEdit,
      editMode: true,
      editIndex: index,
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search logic
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      fetchEmployees(); // Fetch all employees if search term is empty
    } else {
      const filteredEmployees = employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setEmployees(filteredEmployees); // Filter employees based on search term
    }
  };

  // Reset search and fetch all employees
  const resetSearch = () => {
    setSearchTerm('');
    fetchEmployees(); // Fetch all employees
  };

  // Reset form after submission or cancelation
  const resetForm = () => {
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
 
  
  return (
    <div className="App">
      <header className="App-header">
        <div className="employee-form">
          <h2>{formData.editMode ? 'Edit Employee' : 'Add Employee'}</h2>
          <form onSubmit={handleSubmit}>
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />

            <label>Email Address:</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />

            <label>Phone:</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />

            <label>Position:</label>
            <input type="text" name="position" value={formData.position} onChange={handleInputChange} required />

            <label>Employee ID:</label>
            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} required />

            <label>Gender:</label>
            <select name="gender" value={formData.gender} onChange={handleInputChange} required>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <label>Image:</label>
            <input type="file" name="image" onChange={handleImageChange} accept="image/*" />

            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Employee Preview" className="employee-image" />
              </div>
            )}

            <button type="submit">{formData.editMode ? 'Save Changes' : 'Add Employee'}</button>
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          </form>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search Employees..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={resetSearch}>Reset</button>
        </div>

        <div className="employee-list">
          <h2>Employee List</h2>
          <ul>
            {employees.map((employee, index) => (
              <li key={employee.id}>
                <img src={employee.image} alt={employee.name} className="employee-image" />
                <p>Name: {employee.name}</p>
                <p>Email: {employee.email}</p>
                <p>Phone: {employee.phone}</p>
                <p>Position: {employee.position}</p>
                <p>Employee ID: {employee.employeeId}</p>
                <p>Gender: {employee.gender}</p>
                <button onClick={() => editEmployee(index)}>Edit</button>
                <button onClick={() => deleteEmployee(employee.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;


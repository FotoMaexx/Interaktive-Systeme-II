import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  TextInput,
  FileUploader,
  Theme,
  Heading,
} from '@carbon/react';
import '@carbon/styles/css/styles.css';

function App() {
  const [ciData, setCiData] = useState({
    primaryColor: '',
    secondaryColor: '',
    fontFamily: '',
    logoPath: ''
  });
  const [logo, setLogo] = useState(null);

  // Fetch current CI data from the backend
  useEffect(() => {
    fetch('/api/ci')
      .then(response => response.json())
      .then(data => setCiData(data))
      .catch(error => console.error('Error fetching CI data:', error));
  }, []);

  // Handle form submission to update CI data
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/ci', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ciData)
    })
    .then(response => response.json())
    .then(data => {
      alert('CI updated successfully!');
      setCiData(data.corporateIdentity);
    })
    .catch(error => console.error('Error updating CI data:', error));
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('logo', logo);

    fetch('/api/ci/upload-logo', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      alert('Logo uploaded successfully!');
      setCiData(prevState => ({ ...prevState, logoPath: data.logoPath }));
    })
    .catch(error => console.error('Error uploading logo:', error));
  };

  return (
    <Theme theme="white">
      <div style={{ padding: '20px' }}>
        <Heading as="h1" style={{ marginBottom: '20px' }}>Corporate Identity Management</Heading>

        <Form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <TextInput
              id="primaryColor"
              labelText="Primary Color"
              value={ciData.primaryColor}
              onChange={e => setCiData({ ...ciData, primaryColor: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <TextInput
              id="secondaryColor"
              labelText="Secondary Color"
              value={ciData.secondaryColor}
              onChange={e => setCiData({ ...ciData, secondaryColor: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <TextInput
              id="fontFamily"
              labelText="Font Family"
              value={ciData.fontFamily}
              onChange={e => setCiData({ ...ciData, fontFamily: e.target.value })}
            />
          </div>
          <Button type="submit">Update CI</Button>
        </Form>

        <hr style={{ margin: '40px 0' }} />

        <Heading as="h2" style={{ marginBottom: '20px' }}>Logo Upload</Heading>

        <Form onSubmit={handleLogoUpload}>
          <FileUploader
            buttonLabel="Add Logo"
            labelTitle="Upload your company logo"
            onChange={e => setLogo(e.target.files[0])}
          />
          <Button type="submit" style={{ marginTop: '20px' }}>Upload Logo</Button>
        </Form>

        {ciData.logoPath && (
          <div style={{ marginTop: '20px' }}>
            <img src={ciData.logoPath} alt="Company Logo" style={{ width: '150px' }} />
          </div>
        )}
      </div>
    </Theme>
  );
}

export default App;

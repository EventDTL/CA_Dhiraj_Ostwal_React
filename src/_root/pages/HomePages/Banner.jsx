import React, { useState, useEffect } from 'react';
import { useSaveBanner, useGetAllBanner, useDeleteBanner } from '../../../lib/react-query/queries';
import './Banner.css';

const Banner = () => {
  const {
    data: bannerData,
    isLoading: isLoadingBanner,
    refetch: refetchBanners,
  } = useGetAllBanner();

  const [Banners, setBanner] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null); // State to hold id of banner to delete
  const [imageId, setImageId] = useState(null); // State to hold id of banner to delete

  useEffect(() => {
    if (bannerData && bannerData.documents) {
      setBanner(bannerData.documents);
    }
  }, [bannerData]);

  const { mutateAsync: saveBanner, isLoading: isSavingBanner } = useSaveBanner();
  const { mutateAsync: deleteBanner, isLoading: isDeletingBanner } = useDeleteBanner();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData((prevData) => ({
        ...prevData,
        image: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.subtitle || !formData.image) {
      setError('All fields are required.');
      return;
    }

    try {
      await saveBanner(formData);
      setFormData({
        title: '',
        subtitle: '',
        image: null,
      });
      setImagePreview(null);
      setFormSubmitted(true);
      setShowForm(false);
      // Refetch banners after successful submission
      refetchBanners();
    } catch (error) {
      setError('Failed to save banner. Please try again.');
    }
  };

  const handleAddBanner = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      title: '',
      subtitle: '',
      image: null,
    });
    setImagePreview(null);
    setError(null);
  };

 const confirmDelete = async (BannerId, imageId) => {
  try {
    await deleteBanner({ BannerId, imageId });
  } catch (error) {
    console.error('Failed to delete banner:', error);
  }
  // Clear deleteId state after deletion or cancellation
  setDeleteId(null);
  setImageId(null); // Also clear imageId state
};


  const handleEdit = (bannerId) => {
    // Handle edit functionality here
    console.log('Edit banner with id:', bannerId);
  };

  return (
    <div className='banner1-container'>
      <h1>Banners</h1>
      <div className='add-banner-button-container'>
        <button onClick={handleAddBanner} className='add-banner-button'>
          Add Banner
        </button>
      </div>
      {showForm && (
        <div className='form-overlay'>
          <form onSubmit={handleSubmit} className='banner-form'>
            <div className='form-row'>
              <label>Title:</label>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className='form-row'>
              <label>Subtitle:</label>
              <input
                type='text'
                name='subtitle'
                value={formData.subtitle}
                onChange={handleChange}
                required
              />
            </div>
            <div className='form-row'>
              <label>Upload Image:</label>
              <input
                type='file'
                accept='image/*'
                onChange={handleImageChange}
                required
              />
            </div>
            {imagePreview && (
              <div className='image-preview'>
                <img src={imagePreview} alt='Image Preview' />
              </div>
            )}
            <div className='button-row'>
              <button type='submit' disabled={isSavingBanner}>
                {isSavingBanner ? 'Saving...' : 'Add'}
              </button>
              <button type='button' onClick={handleCancel}>
                Cancel
              </button>
            </div>
            {error && <p className='error-message'>{error}</p>}
            {formSubmitted && (
              <p className='success-message'>Banner added successfully!</p>
            )}
          </form>
        </div>
      )}
      <div className='banner-table-container'>
        <table className='banner-table'>
          <thead>
            <tr>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Banners.map((banner) => (
              <tr key={banner.$id}>
                <td>{banner.Title}</td>
                <td>{banner.Subtitle}</td>
                <td>
                  <img
                    src={banner.ImageUrl}
                    alt='Banner'
                    style={{ width: '100px', height: 'auto' }}
                  />
                </td>
                <td>
                  <button
              onClick={() => {setDeleteId(banner.$id);setImageId(banner.ImageId)}}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Delete
            </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deleteId && imageId && (
        <div className='delete-modal'>
          <div className='delete-modal-content'>
            <p>Are you sure you want to delete this banner?</p>
            <div>
             <button
              onClick={() => confirmDelete(deleteId,imageId)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Yes 
            </button>
            <button
              onClick={() => setDeleteId(null)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              No
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner;
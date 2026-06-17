import React, { useState, useRef, useEffect } from 'react';
import { generateDownloadContent } from '../utils/downloadUtils';
import { downloadDocxReport, isDocxAvailable } from '../utils/docxReportUtils';

const DownloadButton = ({ calculation, method, filename, graphRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState('txt');
  const [docxAvailable, setDocxAvailable] = useState(false);
  
  const dropdownRef = useRef(null);
  
  // Check if DOCX is available on mount
  useEffect(() => {
    const checkDocx = async () => {
      try {
        const available = isDocxAvailable();
        setDocxAvailable(available);
      } catch (error) {
        console.warn("Error checking DOCX availability:", error);
        setDocxAvailable(false);
      }
    };
    
    checkDocx();
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (!calculation) return null;
  
  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleTxtDownload = () => {
    try {
      const content = generateDownloadContent(calculation, method);
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || method}_calculation.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error downloading TXT:', error);
      alert(`Помилка завантаження: ${error.message}`);
    }
  };
  
  const handleDocxDownload = () => {
    if (!docxAvailable) {
      alert('Для DOCX формату встановіть npm пакет: npm install docx');
      return;
    }
    
    try {
      // Get canvas element from ref
      const canvas = graphRef?.current?.canvasRef?.current;
      
      // Download DOCX report
      downloadDocxReport(calculation, method, canvas)
        .then(() => {
          setIsOpen(false);
        })
        .catch(error => {
          console.error('Error downloading DOCX:', error);
          alert(`Помилка завантаження DOCX: ${error.message}`);
        });
    } catch (error) {
      console.error('Error initiating DOCX download:', error);
      alert(`Помилка завантаження: ${error.message}`);
    }
  };
  
  return (
    <div className="download-button-container">
      <button
        onClick={handleToggleDropdown}
        className="download-button"
      >
        Завантажити дані
      </button>
      
      {isOpen && (
        <div className="format-dropdown" ref={dropdownRef}>
          <div className="format-options">
            {/* TXT Option */}
            <label className="format-option">
              <input
                type="radio"
                name="format"
                value="txt"
                checked={format === 'txt'}
                onChange={() => setFormat('txt')}
              />
              <span>TXT (тільки текст)</span>
            </label>
            
            {/* DOCX Option */}
            <label className={`format-option ${!docxAvailable ? 'disabled' : ''}`}>
              <input
                type="radio"
                name="format"
                value="docx"
                checked={format === 'docx'}
                onChange={() => docxAvailable && setFormat('docx')}
                disabled={!docxAvailable}
              />
              <span>DOCX (з графіком)</span>
            </label>
            
            {/* Warning message for DOCX */}
            {!docxAvailable && (
              <div className="format-note">
                Для DOCX формату встановіть npm пакет: <code>npm install docx</code>
              </div>
            )}
            
            {/* Download button */}
            <button
              className="confirm-download"
              onClick={format === 'txt' ? handleTxtDownload : handleDocxDownload}
              disabled={format === 'docx' && !docxAvailable}
            >
              Завантажити {format.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadButton;
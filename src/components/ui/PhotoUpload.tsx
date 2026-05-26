import React, { useRef, useState } from 'react';
import styles from './PhotoUpload.module.css';

interface PhotoUploadProps {
  currentURL?: string;
  initials?: string;
  size?: number;
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentURL, initials = '?', size = 72, onUpload, disabled
}) => {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show instant preview
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setLoading(true);
    try { await onUpload(file); }
    finally { setLoading(false); }
  };

  const imgSrc = preview || currentURL;

  return (
    <div
      className={`${styles.wrap} ${disabled ? styles.disabled : ''}`}
      style={{ width: size, height: size }}
      onClick={() => !disabled && !loading && inputRef.current?.click()}
      title="Clique para alterar foto"
    >
      {imgSrc ? (
        <img src={imgSrc} className={styles.photo} alt="avatar" />
      ) : (
        <div className={styles.initials} style={{ fontSize: size * 0.34 }}>{initials}</div>
      )}

      {loading ? (
        <div className={styles.overlay}>
          <span className={styles.spinner} />
        </div>
      ) : (
        <div className={styles.overlay}>
          <span className={styles.cameraIcon}>📷</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.hidden}
        onChange={handleChange}
        disabled={disabled || loading}
      />
    </div>
  );
};

export default PhotoUpload;

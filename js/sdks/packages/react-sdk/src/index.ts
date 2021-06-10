import Downloader from './components/elements/downloader';
import Paragraph from './components/elements/paragraph';
import Uploader from './components/elements/uploader';
import wrapComponent from './components/wrapComponent';
export * from './components/SecureForm';
export * from './components/SecureFormContext';
export * from './components/SecureInput';
export * from './components/SecureSubmit';
export * from './types';
export const SecureParagraph = wrapComponent<'p'>(Paragraph, 'p');
export const SecureDownload = wrapComponent<'a'>(Downloader, 'a');
export const SecureUpload = wrapComponent<'input'>(Uploader, 'input');
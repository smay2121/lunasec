import Downloader from './components/elements/downloader';
import Input from './components/elements/input';
import Paragraph from './components/elements/paragraph';
import TextArea from './components/elements/textarea';
import Uploader from './components/elements/uploader';
import wrapComponent from './components/wrapComponent';
export * from './components/SecureForm';
export * from './providers/SecureFormContext';
export * from './providers/LunaSecConfigContext';
export * from './components/SecureSubmit';
export * from './types';
export { LunaSecError } from '@lunasec/browser-common'; //expose this so users can use it as well
export const SecureParagraph = wrapComponent(Paragraph, 'Paragraph');
export const SecureDownload = wrapComponent(Downloader, 'Downloader');
export const SecureUpload = wrapComponent(Uploader, 'Uploader');
export const SecureTextArea = wrapComponent(TextArea, 'TextArea');
export const SecureInput = wrapComponent(Input, 'Input');

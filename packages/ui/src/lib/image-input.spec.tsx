import { fireEvent, render, waitFor } from '@testing-library/react';
import { ImageInputField, shrinkImage, UPLOAD_MAX_BYTES } from './image-input';

function fileOf(size: number, type: string, name = 'foto.jpg'): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe('shrinkImage', () => {
  it('keeps small images of an accepted type untouched', async () => {
    const file = fileOf(1024, 'image/jpeg');
    await expect(shrinkImage(file)).resolves.toBe(file);
  });

  it('keeps an image exactly at the limit', async () => {
    const file = fileOf(UPLOAD_MAX_BYTES, 'image/png', 'logo.png');
    await expect(shrinkImage(file)).resolves.toBe(file);
  });
});

describe('ImageInputField', () => {
  it('is a file input limited to the accepted types', () => {
    const { container } = render(<ImageInputField id="logo" label="Logo" />);
    const input = container.querySelector<HTMLInputElement>('#logo');
    expect(input?.type).toBe('file');
    expect(input?.accept).toBe('image/png,image/jpeg,image/webp');
  });

  it('reports the picked file', async () => {
    const onImageChange = jest.fn();
    const { container } = render(
      <ImageInputField id="logo" label="Logo" onImageChange={onImageChange} />,
    );
    const input = container.querySelector<HTMLInputElement>('#logo')!;
    const file = fileOf(2048, 'image/webp', 'logo.webp');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onImageChange).toHaveBeenCalledWith(file));
  });
});

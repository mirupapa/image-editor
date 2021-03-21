import { Box, Flex, Button, Heading } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import ReactCrop, { Crop, PercentCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const Editor: React.FC = () => {
  const [src, setSrc] = useState<string | ArrayBuffer | null>()
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 30,
    aspect: 16 / 9,
  })
  const [croppedImageUrl, setCroppedImageUrl] = useState('')

  const imageRef = useRef<HTMLImageElement | null>(null)
  const fileUrl = useRef<string | null>(null)

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      console.log('reader', reader)
      reader.addEventListener('loadend', () => setSrc(reader.result))
      console.log('addEventListener', reader)
      reader.readAsDataURL(e.target.files[0])
      console.log('readAsDataURL', reader)
      reader.addEventListener('error', () => alert(reader.result))
    }
  }

  const makeClientCrop = async (crop: Crop) => {
    console.log(imageRef.current, crop)
    if (imageRef.current && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(imageRef.current, crop, 'newFile.jpeg')
      setCroppedImageUrl(croppedImageUrl)
    }
  }

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop,
    fileName: string,
  ): Promise<string> => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width || 0
    canvas.height = crop.height || 0
    const ctx = canvas.getContext('2d')

    ctx?.drawImage(
      image,
      (crop.x || 0) * scaleX,
      (crop.y || 0) * scaleY,
      (crop.width || 0) * scaleX,
      (crop.height || 0) * scaleY,
      0,
      0,
      crop.width || 0,
      crop.height || 0,
    )

    return new Promise((resolve, _) => {
      canvas.toBlob((blob) => {
        if (blob == null) {
          console.error('Canvas is empty')
          return
        }

        // blob.name = fileName
        window.URL.revokeObjectURL(fileUrl.current || '')
        fileUrl.current = window.URL.createObjectURL(blob)
        resolve(fileUrl.current)
      }, 'image/jpeg')
    })
  }

  const onImageLoaded = (image: HTMLImageElement) => {
    imageRef.current = image
  }

  const onCropComplete = (crop: Crop) => {
    makeClientCrop(crop)
  }

  const onCropChange = (crop: Crop, percentCrop: PercentCrop) => {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    setCrop(crop)
  }

  const download = () => {
    fetch(croppedImageUrl, {
      method: 'GET',
      headers: {},
    })
      .then((response) => {
        response.arrayBuffer().then(function (buffer) {
          const url = window.URL.createObjectURL(new Blob([buffer]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'image.png') //or any other extension
          document.body.appendChild(link)
          link.click()
        })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <Flex justify="center" alignItems="center">
      <Box width="xl">
        <Flex justify="center" marginBottom="10">
          <Heading>IMAGE EDITOR</Heading>
        </Flex>
        <Flex justify="center" marginBottom="1">
          <input type="file" accept="image/*" onChange={onSelectFile} />
          <Button
            colorScheme="blue"
            type="button"
            onClick={() => download()}
            disabled={src == null}
          >
            download
          </Button>
        </Flex>
        {typeof src === 'string' && (
          <ReactCrop
            src={src}
            crop={crop}
            ruleOfThirds
            onImageLoaded={onImageLoaded}
            onComplete={onCropComplete}
            onChange={onCropChange}
          />
        )}
        <Flex justify="center" alignItems="center">
          {croppedImageUrl && <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />}
        </Flex>
      </Box>
    </Flex>
  )
}

export default Editor

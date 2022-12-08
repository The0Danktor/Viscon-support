import React, { useState, useEffect } from "react";
import { isConstructorDeclaration, isJSDocAugmentsTag } from "typescript";
import { ImageGallery } from "../components/Shared/ImageGallery";
import { NavSide } from "../components/Shared/NavSide";
import placeholder from "../assets/add_picture.png";
import { SlowBuffer } from "buffer";
export function AddImage() {
  var errors = {
    wrongFile: "You can only add images and videos",
    overLimit: "You can only add up to 10 files",
    overLimitVideo: "You can only add 1 video",
    overLimitMB: "You can only add files below 500MB",
  };
  const [displayError, setError] = useState(""),
    [files, setFiles] = useState([] as any),
    [imageURLS, setImageURLs] = useState<Array<string>>([]), // list of images
    [videoURLS, setVideoURLs] = useState<Array<string>>([]); // list of videos

  useEffect(() => {
    var lImages = [...imageURLS];
    var lVideos = [...videoURLS];

    // checks how many files are added
    if (lImages.length + lVideos.length + files.length > 10) {
      setError(errors.overLimit);
      return;
    }

    files.forEach((file: any) => {
      // checks if file is video or image
      if (file.type.includes("image/")) lImages.push(URL.createObjectURL(file));
      else if (file.type.includes("video/") && lVideos.length < 1) {
        lVideos.push(URL.createObjectURL(file));
        // lImages.push(URL.createObjectURL(file));
      } else {
        setError(errors.wrongFile); // if file is neither image or video
        if (file.type.includes("video/") && lVideos.length == 1)
          setError(errors.overLimitVideo); // if more than 1 video is added
        else if (file.size > 524288000) setError(errors.overLimitMB); // if file exceeds maximum size
      }

      setImageURLs(lImages);
      setVideoURLs(lVideos);
    });
  }, [files]);
  function displayImg(e: any) {
    setFiles([...e.target.files]);
  }
  function delet(e: any) {
    const filteredList = imageURLS.filter((element) => element != e);
    setError("");
    setImageURLs(filteredList);
  }
  return (
    <div className="flex dark:bg-gray-900 transition duration-300 z-20">
      <div className="hidden md:flex">
        <NavSide />
      </div>
      <div className="container">
        <div className="grow w-full p-3">
          <strong className="text-2xl">Select images</strong>
          <form>
            <div className="relative w-full md:w-fit overflow-hidden ">
              <label htmlFor="file" className="cursor-pointer">
                <p
                  className="border md:w-40 border-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 
                hover:bg-gray-200 dark:text-gray-400 rounded-lg ml-3 mb-2 md:mb-[unset] py-2 text-center"
                >
                  Browse files
                </p>
              </label>
              <input
                type="file"
                id="file"
                accept="image/*, video/*"
                onChange={displayImg}
                multiple
                hidden
              />
            </div>
          </form>

          {/* displays the images */}
          <div className="flex flex-wrap ">
            <ImageGallery src={imageURLS} del={delet} />
            {/* <ImageGallery src={videoURLS} del={delet} /> */}

            {/* {videoURLS.map((videoPreview: any) => (
              <video
                // controls
                src={videoPreview}
                className="h-auto w-full md:min-h-[40px] md:max-h-64 md:w-[unset] my-2"
              />
            ))} */}
          </div>
          {displayError != "" ? (
            <p className="text-red-500 text-sm">{displayError}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
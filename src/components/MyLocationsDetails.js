import { MapContainer, Marker, Popup, TileLayer, Polygon } from "react-leaflet";
import Leaflet from "leaflet";
import { useEffect, useState } from "react";
import { FaFileCsv, FaTrash, FaEdit } from "react-icons/fa";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import serverURL from "../utils/urls";
import getCsvData from "../utils/csv";
import useAuth from "../hooks/useAuth";
import DownloadMap from "../utils/downloadmap";

export default function MyLocationsDetails({ handleSelectLocationForUpdate }) {
  // get the authenticated user from a custom hook effect
  const { authUser } = useAuth();

  // create the state variables
  const [locations, setLocations] = useState([]);
  const [coordinates, setCoordinates] = useState([]);

  // create a polygon color
  const polygonColor = { color: "blue" };

  // function to handle the deletion of a user's location
  const handleDeleteLocation = async (locationToDelete) => {
    // get a cookie value
    const authToken = Cookies.get("authToken");

    try {
      await axios.delete(`${serverURL}/locations/delete`, {
        data: {
          id: locationToDelete?._id,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      // filter out the deleted location
      const updatedLocations = locations.filter(
        (location) => location._id !== locationToDelete?._id,
      );

      // update the locations state variable
      setLocations(updatedLocations);

      // update the coordinates
      const updatedCoodinates = updatedLocations.map((location) => [
        location.latitude,
        location.longitude,
      ]);
      setCoordinates(updatedCoodinates);

      // display a success message
      toast.success("Location deleted successfully!");
    } catch (error) {
      const responseError = error?.response?.data?.message;
      toast.error(responseError || error.message);
    }
  };

  // create the custom marker
  const markerIcon = new Leaflet.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    const userLocations = authUser?.locations || [];
    const initializeLocations = () => {
      setLocations(userLocations);

      // set the coordinates
      const coordinates = userLocations?.map((location) => [
        location?.latitude,
        location?.longitude,
      ]);
      setCoordinates(coordinates);
    };

    initializeLocations();
  }, [authUser]);

  return (
    <div className="text-black dark:text-white p-3 lg:p-10">
      <div className="h-1/2">
        <p className="my-3 lg:my-7">
          Places you have visited and your coverage
        </p>
        <div className="relative">
          <div className="absolute z-50 right-0 flex">
            <button
              type="button"
              onClick={() => {
                getCsvData("locations");
              }}
            >
              <FaFileCsv size={24} />
            </button>
          </div>
          <MapContainer
            id="myLocationsMap"
            placeholder
            center={[51.505, -0.09]}
            zoom={2}
            scrollWheelZoom={false}
            className="h-[300px] bg-black w-auto z-40 leaflet-container"
          >
            <DownloadMap
              position="topleft"
              sizeModes={["Current", "A4Portrait", "A4Landscape"]}
              hideControlContainer={false}
              title="Export as PNG"
              exportOnly
            />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations?.length
              ? locations?.map((location) => (
                  <Marker
                    className="leaflet-marker-icon"
                    key={location?._id}
                    position={[location?.latitude, location?.longitude]}
                    icon={markerIcon}
                  >
                    <Popup>{location?.name}</Popup>
                  </Marker>
                ))
              : null}
            <Polygon pathOptions={polygonColor} positions={coordinates} />
          </MapContainer>
        </div>
      </div>
      <div className="h-1/2">
        <p className="my-3 lg:my-7">
          Edit or delete a place you have visited from the map!
        </p>

        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {locations?.length > 0 ? (
            locations?.map((location) => (
              <div
                key={location?._id}
                id={location?._id}
                className="group  w-full  relative z-10 rounded-2xl shadow-lg dark:shadow-black bg-[#f6f6f9]rounded-2xl dark:bg-dark_green transition-all duration-1000"
              >
                <div className="group-hover:scale-105 group-hover:bg-[rgb(246,246,249)] bg-[#f6f6f9] dark:bg-dark_green dark:group-hover:bg-dark_green rounded-2xl absolute h-48 w-full z-20 transition-all duration-300 p-3 flex flex-col space-y-3" />
                <div className=" h-48 w-full   z-20 p-3 rounded-2xl ">
                  <div className="flex h-full flex-col justify-between relative z-40 w-full">
                    <div className="h-3/4 flex flex-col justify-between">
                      <div className="text-sm">
                        <span className="text-green-500">location:</span>
                        <span className="ml-3">{location?.name}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-green-500">lat:</span>
                        <span className="ml-2">{location?.latitude}</span>
                        <span className="ml-5 text-green-500">long:</span>
                        <span className="ml-2">{location?.longitude}</span>
                      </div>
                    </div>

                    <div className="h-1/4">
                      <div className="flex justify-between items-center w-full left-0 absolute bottom-0">
                        <button
                          onClick={() => {
                            handleDeleteLocation(location);
                          }}
                          type="button"
                          className="primary-button p-2 rounded-md flex items-center space-x-2 border border-red-500 cursor-pointer"
                        >
                          <FaTrash />{" "}
                        </button>
                        <button
                          onClick={() => {
                            handleSelectLocationForUpdate(location);
                          }}
                          type="button"
                          className="primary-button p-2 rounded-md flex items-center space-x-2 border border-green-500 cursor-pointer"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="absolute left-0  w-full justify-center ">
              <div className="flex mx-24  flex-col space-y-5 p-3 lg:p-10 justify-center items-center">
                <p className="text-center text-orange-600">
                  You have not visited a place yet! Click the button below to
                  add a place you have visited!
                </p>
                <Link
                  to="/add-location"
                  className="text-black dark:text-white hover:text-black  ml-3 p-2 border-[1px] border-border_color rounded hover:border-green-500  hover:shadow transition-all duration-200 no-underline hover:no-underline"
                >
                  Add Location
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
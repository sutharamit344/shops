"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserCoords } from "@/redux/slices/searchSlice";

export default function LocationInit() {
  const dispatch = useDispatch();
  const userCoords = useSelector((state) => state.search.userCoords);

  useEffect(() => {
    // PERSISTENT LOCATION HYDRATION
    // Load cached coordinates from localStorage so distance calculations work even without live GPS
    const lastLat = localStorage.getItem('last_lat');
    const lastLng = localStorage.getItem('last_lng');
    const lastCity = localStorage.getItem('last_city');
    const lastArea = localStorage.getItem('last_area');

    if (lastLat && lastLng && !userCoords) {
      dispatch(setUserCoords({ 
        coords: { lat: parseFloat(lastLat), lng: parseFloat(lastLng) }, 
        name: lastArea || lastCity || ""
      }));
    }
  }, [dispatch, userCoords]);

  return null;
}

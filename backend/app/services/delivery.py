import httpx
import math
from typing import Dict, Any, Optional
from app.core.config import settings

class DeliveryService:
    def __init__(self):
        self.store_location = {
            "lat": 19.0760,  # Mumbai coordinates
            "lng": 72.8777,
            "address": "123 Market Street, Mumbai, Maharashtra"
        }
        
        self.delivery_areas = [
            {"name": "Central Mumbai", "max_distance": 15, "active": True},
            {"name": "South Mumbai", "max_distance": 20, "active": True},
            {"name": "North Mumbai", "max_distance": 12, "active": True},
            {"name": "East Mumbai", "max_distance": 18, "active": True},
            {"name": "West Mumbai", "max_distance": 16, "active": True}
        ]
        
        self.rate_per_km = 5  # ₹5 per km
        self.minimum_fee = 20  # Minimum ₹20
        self.maximum_fee = 100  # Maximum ₹100
        self.free_delivery_threshold = 500  # Free delivery above ₹500

    def calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two coordinates using Haversine formula."""
        R = 6371  # Earth's radius in kilometers
        
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        
        a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlng / 2) * math.sin(dlng / 2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    async def get_coordinates_from_address(self, address: str) -> Optional[Dict[str, Any]]:
        """Get coordinates from address using geocoding API."""
        if not settings.GEOCODING_API_KEY:
            # Return mock coordinates for Mumbai area for demo
            return {
                "lat": 19.0760 + (hash(address) % 100) / 10000,  # Small variation
                "lng": 72.8777 + (hash(address) % 100) / 10000,
                "formatted_address": address
            }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.opencagedata.com/geocode/v1/json",
                    params={
                        "q": address,
                        "key": settings.GEOCODING_API_KEY,
                        "limit": 1,
                        "countrycode": "in"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data["results"]:
                        result = data["results"][0]
                        return {
                            "lat": result["geometry"]["lat"],
                            "lng": result["geometry"]["lng"],
                            "formatted_address": result["formatted"]
                        }
        except Exception as e:
            print(f"Geocoding error: {e}")
        
        return None

    async def calculate_delivery_fee(self, customer_address: str, order_total: float) -> Dict[str, Any]:
        """Calculate delivery fee based on distance and order total."""
        
        # If order total is above threshold, delivery is free
        if order_total >= self.free_delivery_threshold:
            return {
                "fee": 0,
                "distance": 0,
                "message": "Free delivery on orders above ₹500",
                "deliverable": True,
                "area": "All Areas"
            }
        
        try:
            # Get customer coordinates
            customer_coords = await self.get_coordinates_from_address(customer_address)
            
            if not customer_coords:
                # Fallback to standard fee
                return {
                    "fee": self.minimum_fee,
                    "distance": 0,
                    "message": f"Standard delivery fee: ₹{self.minimum_fee}",
                    "deliverable": True,
                    "area": "Standard"
                }
            
            # Calculate distance
            distance = self.calculate_distance(
                self.store_location["lat"],
                self.store_location["lng"],
                customer_coords["lat"],
                customer_coords["lng"]
            )
            
            # Check if address is in deliverable area
            deliverable_area = None
            for area in self.delivery_areas:
                if area["active"] and distance <= area["max_distance"]:
                    deliverable_area = area
                    break
            
            if not deliverable_area:
                return {
                    "fee": 0,
                    "distance": round(distance, 2),
                    "message": "Sorry, we do not deliver to this area",
                    "deliverable": False,
                    "area": None
                }
            
            # Calculate fee
            fee = math.ceil(distance) * self.rate_per_km
            fee = max(fee, self.minimum_fee)
            fee = min(fee, self.maximum_fee)
            
            return {
                "fee": fee,
                "distance": round(distance, 2),
                "message": f"Delivery fee: ₹{fee} ({math.ceil(distance)} km)",
                "deliverable": True,
                "area": deliverable_area["name"]
            }
            
        except Exception as e:
            print(f"Delivery calculation error: {e}")
            return {
                "fee": self.minimum_fee,
                "distance": 0,
                "message": f"Standard delivery fee: ₹{self.minimum_fee}",
                "deliverable": True,
                "area": "Standard"
            }

    def validate_delivery_area(self, address: str) -> bool:
        """Validate if delivery is available to the address."""
        # For demo purposes, assume all addresses in Mumbai are deliverable
        mumbai_keywords = ["mumbai", "bombay", "maharashtra"]
        return any(keyword in address.lower() for keyword in mumbai_keywords)

    def get_available_delivery_slots(self, date: Optional[str] = None) -> list:
        """Get available delivery slots."""
        slots = [
            {"id": "9-12", "time": "9:00 AM - 12:00 PM", "available": True},
            {"id": "12-15", "time": "12:00 PM - 3:00 PM", "available": True},
            {"id": "15-18", "time": "3:00 PM - 6:00 PM", "available": True},
            {"id": "18-21", "time": "6:00 PM - 9:00 PM", "available": True}
        ]
        
        # Add logic to check slot availability based on existing orders
        # This is a simplified version
        return slots

    def estimate_delivery_time(self, distance: float) -> Dict[str, Any]:
        """Estimate delivery time based on distance."""
        # Base preparation time: 30 minutes
        # Travel time: 3 minutes per km (considering traffic)
        preparation_time = 30
        travel_time = math.ceil(distance * 3)
        total_time = preparation_time + travel_time
        
        return {
            "preparation_time": preparation_time,
            "travel_time": travel_time,
            "total_time": total_time,
            "estimated_delivery": f"{total_time} minutes"
        }

# Create singleton instance
delivery_service = DeliveryService()
from datetime import datetime, timedelta
from ..services.customer import CustomerService
from ..services.appointment import AppointmentService
from ..services.complaint import ComplaintService
from ..services.lead import LeadService
from ..services.vehicle import VehicleService


AGENT_FUNCTIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_vehicle_info",
            "description": "Get information about a Tata vehicle model including price, specs, and features",
            "parameters": {
                "type": "object",
                "properties": {
                    "model_name": {
                        "type": "string",
                        "description": "Name of the vehicle model (e.g., Nexon, Punch, Safari)"
                    }
                },
                "required": ["model_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_appointment_slots",
            "description": "Check available appointment slots for a specific date",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format"
                    },
                    "appointment_type": {
                        "type": "string",
                        "enum": ["test_drive", "service", "consultation"],
                        "description": "Type of appointment"
                    }
                },
                "required": ["date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "book_test_drive",
            "description": "Book a test drive appointment for a customer",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {
                        "type": "string",
                        "description": "Customer's full name"
                    },
                    "customer_phone": {
                        "type": "string",
                        "description": "Customer's phone number"
                    },
                    "vehicle_model": {
                        "type": "string",
                        "description": "Vehicle model for test drive"
                    },
                    "date": {
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format"
                    },
                    "time_slot": {
                        "type": "string",
                        "description": "Time slot for the appointment"
                    }
                },
                "required": ["customer_name", "customer_phone", "vehicle_model", "date", "time_slot"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "book_service_appointment",
            "description": "Book a service appointment for vehicle maintenance or repair",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {
                        "type": "string",
                        "description": "Customer's name"
                    },
                    "customer_phone": {
                        "type": "string",
                        "description": "Customer's phone number"
                    },
                    "vehicle_reg_no": {
                        "type": "string",
                        "description": "Vehicle registration number"
                    },
                    "service_type": {
                        "type": "string",
                        "description": "Type of service needed"
                    },
                    "date": {
                        "type": "string",
                        "description": "Preferred date (YYYY-MM-DD)"
                    },
                    "time_slot": {
                        "type": "string",
                        "description": "Preferred time slot"
                    }
                },
                "required": ["customer_name", "customer_phone", "date", "time_slot"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "register_complaint",
            "description": "Register a customer complaint",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {
                        "type": "string",
                        "description": "Customer's name"
                    },
                    "customer_phone": {
                        "type": "string",
                        "description": "Customer's phone number"
                    },
                    "category": {
                        "type": "string",
                        "enum": ["vehicle_defect", "service_quality", "delivery_delay", "billing_issue", "staff_behavior", "spare_parts", "warranty_claims", "other"],
                        "description": "Category of complaint"
                    },
                    "description": {
                        "type": "string",
                        "description": "Detailed description of the complaint"
                    }
                },
                "required": ["customer_name", "customer_phone", "category", "description"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_offers",
            "description": "Get current offers and discounts available",
            "parameters": {
                "type": "object",
                "properties": {
                    "model_name": {
                        "type": "string",
                        "description": "Optional: specific model to get offers for"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_lead",
            "description": "Add a new sales lead to the system",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Lead's name"
                    },
                    "phone": {
                        "type": "string",
                        "description": "Lead's phone number"
                    },
                    "interested_model": {
                        "type": "string",
                        "description": "Vehicle model they're interested in"
                    },
                    "budget": {
                        "type": "string",
                        "description": "Customer's budget range"
                    },
                    "notes": {
                        "type": "string",
                        "description": "Additional notes about the lead"
                    }
                },
                "required": ["name", "phone"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "request_human_takeover",
            "description": "Request transfer to human agent when unable to help or customer requests it",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {
                        "type": "string",
                        "description": "Reason for requesting human takeover"
                    }
                },
                "required": ["reason"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_customer_history",
            "description": "Get customer's history including past purchases and service records",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone": {
                        "type": "string",
                        "description": "Customer's phone number"
                    }
                },
                "required": ["phone"]
            }
        }
    }
]


def execute_function(function_name, arguments, call_id=None):
    """Execute an agent function and return the result"""

    if function_name == "get_vehicle_info":
        model_name = arguments.get("model_name", "")
        vehicles = VehicleService.search(model_name)
        if vehicles:
            return {
                "success": True,
                "data": vehicles,
                "message": f"Found {len(vehicles)} variants of {model_name}"
            }
        return {
            "success": False,
            "message": f"No vehicle found with name {model_name}"
        }

    elif function_name == "check_appointment_slots":
        date = arguments.get("date", "")
        apt_type = arguments.get("appointment_type", "test_drive")

        if not date:
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            date = tomorrow

        slots = AppointmentService.get_available_slots(date, apt_type)
        return {
            "success": True,
            "date": date,
            "available_slots": slots,
            "message": f"{len(slots)} slots available on {date}"
        }

    elif function_name == "book_test_drive":
        appointment = AppointmentService.create({
            "customer_name": arguments.get("customer_name"),
            "customer_phone": arguments.get("customer_phone"),
            "vehicle_model": arguments.get("vehicle_model"),
            "date": arguments.get("date"),
            "time_slot": arguments.get("time_slot"),
            "type": "test_drive",
            "booked_via": "ai_call",
            "call_id": call_id
        })
        return {
            "success": True,
            "appointment_id": appointment["appointment_id"],
            "message": f"Test drive booked for {arguments.get('vehicle_model')} on {arguments.get('date')} at {arguments.get('time_slot')}"
        }

    elif function_name == "book_service_appointment":
        appointment = AppointmentService.create({
            "customer_name": arguments.get("customer_name"),
            "customer_phone": arguments.get("customer_phone"),
            "vehicle_model": arguments.get("vehicle_reg_no", ""),
            "date": arguments.get("date"),
            "time_slot": arguments.get("time_slot"),
            "type": "service",
            "notes": arguments.get("service_type", ""),
            "booked_via": "ai_call",
            "call_id": call_id
        })
        return {
            "success": True,
            "appointment_id": appointment["appointment_id"],
            "message": f"Service appointment booked for {arguments.get('date')} at {arguments.get('time_slot')}"
        }

    elif function_name == "register_complaint":
        complaint = ComplaintService.create({
            "customer_name": arguments.get("customer_name"),
            "customer_phone": arguments.get("customer_phone"),
            "category": arguments.get("category"),
            "description": arguments.get("description")
        })
        return {
            "success": True,
            "complaint_id": complaint["complaint_id"],
            "message": f"Complaint registered with ID {complaint['complaint_id']}. Our team will contact you within 24 hours."
        }

    elif function_name == "get_current_offers":
        model = arguments.get("model_name")
        if model:
            vehicles = VehicleService.search(model)
            offers = [v for v in vehicles if v.get('current_offer')]
        else:
            offers = VehicleService.get_current_offers()

        return {
            "success": True,
            "offers": offers,
            "general_offers": [
                "Exchange Bonus: Up to ₹50,000",
                "Corporate Discount: ₹15,000",
                "First-time buyer: ₹10,000 off",
                "Special Finance: 7.99% interest"
            ]
        }

    elif function_name == "add_lead":
        lead = LeadService.create({
            "name": arguments.get("name"),
            "phone": arguments.get("phone"),
            "interested_model": arguments.get("interested_model", ""),
            "budget": arguments.get("budget", ""),
            "notes": arguments.get("notes", ""),
            "source": "call"
        })
        return {
            "success": True,
            "lead_id": lead["lead_id"],
            "message": "Lead captured successfully"
        }

    elif function_name == "request_human_takeover":
        return {
            "success": True,
            "takeover_requested": True,
            "reason": arguments.get("reason"),
            "message": "Transferring to human agent"
        }

    elif function_name == "get_customer_history":
        phone = arguments.get("phone")
        customer = CustomerService.get_by_phone(phone)
        if customer:
            appointments = AppointmentService.get_by_customer(customer['customer_id'])
            complaints = ComplaintService.get_by_customer(customer['customer_id'])
            return {
                "success": True,
                "customer": customer,
                "appointments": appointments,
                "complaints": complaints
            }
        return {
            "success": False,
            "message": "No customer found with this phone number"
        }

    return {"success": False, "message": f"Unknown function: {function_name}"}

const Event = require('../models/Event');

//get All events
const getAllEvents = async (req,res) =>{
    try{
        const filters = {};
        if(req.query.category){
            filters.category = req.query.category;
        }
        if(req.query.location){
            filters.location = req.query.location;
        }

        const events = await Event.find(filters);
        res.json(events);
    }catch(error){
        res.status(500).json({error: error.message})
    }
}

const getEventById = async (req,res) =>{
   try{
        const event = await Event.findById(req.params.id);
        if(!event) return res.status(400).json({message:'event not found'});
        res.json(event);
   }catch(error){
        return res.status(500).json({error:error.message});
   }
}

const createEvent = async (req,res) =>{ 
       
    try{
         const eventData = req.body;
         eventData.createdBy = req.user._id;
        if(eventData.availableSeats == null && eventData.totalSeats != null){
            eventData.availableSeats = eventData.totalSeats;
        }
        const eventExists = await Event.findOne({title:eventData.title});
        if(eventExists) return res.status(400).json({message:'event already exists'});
        const event = await Event.create(eventData);
        return res.status(200).json({message:'event created successfully',event});
    }
    catch(error){
        return res.status(500).json({error:error.message});
    }
}

const updateEvent = async (req,res) =>{ 
       
    try{
         const eventData = req.body;
        if(eventData.availableSeats == null && eventData.totalSeats != null){
            eventData.availableSeats = eventData.totalSeats;
        }
           const event =  await Event.findByIdAndUpdate(req.params.id,eventData,{new:true});
           if (!event) {
                 return res.status(404).json({
                    message: 'Event not found'
                });
            }
        return res.status(200).json({message:'event updated successfully',event});
    }
    catch(error){
        return res.status(500).json({error:error.message});
    }
}

const deleteEvent = async (req,res) =>{ 
       
    try{
           const event =  await Event.findByIdAndDelete(req.params.id);
           if (!event) {
                 return res.status(404).json({
                    message: 'Event not found'
                });
            }
        return res.status(200).json({message:'event deleted successfully',event});
    }
    catch(error){
        return res.status(500).json({error:error.message});
    }
}

module.exports = {getAllEvents,getEventById,createEvent,deleteEvent,updateEvent};





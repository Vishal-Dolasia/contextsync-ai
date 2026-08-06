import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import meetingModel from '../models/meeting.model.js';
import transcriptModel from "../models/transcript.model.js";

const router = express.Router();

// NOTE: Keeping handler structure similar to client.routes.js for consistency.
// TODO: If desired later, extract these handlers into a separate controller file.

// Create meeting
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, date, time, status, client } = req.body;
  const owner = req.user.id;

  try {
    const meeting = await meetingModel.create({
      title,
      description,
      date,
      time,
      status,
      client,
      owner,
    });

    res.status(201).json({ message: 'Meeting created successfully', meeting });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all meetings for owner
router.get('/', authMiddleware, async (req, res) => {
  try {
    const owner = req.user.id;
    const query = req.query.search;
    const sort = req.query.sort;
    let data;
    let sortOption = {};

    if (sort === 'az') {
      sortOption = { title: 1 };
    } else if (sort === 'za') {
      sortOption = { title: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    if (!query) {
      data = await meetingModel
        .find({ owner })
        .sort(sortOption)
        .populate('client', 'name company');
    } else {
      data = await meetingModel
        .find({
          owner,
          $or: [
            {
              title: {
                $regex: query,
                $options: 'i',
              },
            },
            {
              description: {
                $regex: query,
                $options: 'i',
              },
            },
            {
              status: {
                $regex: query,
                $options: 'i',
              },
            },
          ],
        })
        .sort(sortOption)
        .populate('client', 'name company');
    }

    res.status(200).json({ message: 'Collected all the data', data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get single meeting
router.get('/:id', authMiddleware, async (req, res) => {
  const meetingId = req.params.id;
  const owner = req.user.id;

  try {
    const meeting = await meetingModel.findOne({ _id: meetingId, owner });
    if (meeting === null) {
      return res.status(404).json({ message: 'Meeting not found' });
    } else {
      return res.status(200).json({ message: 'Meeting found', meeting });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Some error' });
  }
});


router.get('/:id/transcript',authMiddleware,async(req,res)=>{
  try{
    
    const meetingId = req.params.id;
    const owner = req.user.id;
  
    const meeting = await meetingModel.findOne({
      _id:meetingId,
      owner,
    });
  
  
    if(!meeting){
      return res.status(404).json({
        message: "Meeting not found",
      });
    }
  
    const transcript = await transcriptModel.findOne({
      meetingId,
    })
  
    if(!transcript){
      return res.status(404).json({
        message : "transcript not found"
      })
    }
    return res.status(200).json({
        message: "Transcript fetched successfully",
        transcript,
    });
  }catch(err){
    console.log(err);

    return res.status(500).json({
        message: "Server error",
    });
    
  }
})


// Update meeting
router.patch('/:id', authMiddleware, async (req, res) => {
  const meetingId = req.params.id;
  const owner = req.user.id;
  const { title, description, date, time, status, client } = req.body;

  try {
    const meeting = await meetingModel.findOneAndUpdate(
      { _id: meetingId, owner },
      {
        $set: { title, description, date, time, status, client },
      },
      { new: true }
    );

    if (meeting === null) {
      return res.status(404).json({ message: 'Meeting was not found' });
    }

    return res.status(200).json({ message: 'Meeting updated successfully', meeting });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete meeting
router.delete('/:id', authMiddleware, async (req, res) => {
  const meetingId = req.params.id;
  const owner = req.user.id;

  try {
    const meeting = await meetingModel.findOneAndDelete({ _id: meetingId, owner });

    if (meeting) {
      return res.status(200).json({ message: 'Meeting deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Meeting was not found' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
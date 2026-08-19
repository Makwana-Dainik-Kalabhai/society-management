const Event = require('../models/Event');
const Poll = require('../models/Poll');
const Document = require('../models/Document');

// --- EVENTS ---
const getEvents = async (req, res, next) => {
  try {
    const rawSocietyId = req.user.societyId || req.query.societyId;
    const query = rawSocietyId ? { societyId: rawSocietyId } : {};
    const events = await Event.find(query).sort({ eventDate: 1 }).populate('organizer', 'fullName');

    // Attach user registration status
    const formatted = events.map(e => {
      const myReg = e.registrations.find(r => r.userId?.toString() === req.user._id.toString());
      return {
        ...e.toObject(),
        isRegistered: !!myReg,
        myAttendees: myReg ? myReg.attendees : 0,
        totalRegisteredAttendees: e.registrations.reduce((sum, r) => sum + (r.attendees || 1), 0)
      };
    });

    res.json({ success: true, events: formatted });
  } catch (err) {
    next(err);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const societyId = req.user.societyId || req.body.societyId;
    const event = await Event.create({
      ...req.body,
      societyId,
      organizer: req.user._id
    });
    res.status(201).json({ success: true, message: 'Event scheduled successfully', event });
  } catch (err) {
    next(err);
  }
};

const registerForEvent = async (req, res, next) => {
  try {
    const { attendees = 1 } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const existingIdx = event.registrations.findIndex(r => r.userId?.toString() === req.user._id.toString());
    if (existingIdx > -1) {
      // Update or toggle RSVP
      event.registrations.splice(existingIdx, 1);
    } else {
      event.registrations.push({
        userId: req.user._id,
        attendees: Number(attendees),
        registeredAt: new Date()
      });
    }

    await event.save();
    res.json({ success: true, message: 'RSVP updated successfully', registrations: event.registrations });
  } catch (err) {
    next(err);
  }
};

// --- POLLS ---
const getPolls = async (req, res, next) => {
  try {
    const rawSocietyId = req.user.societyId || req.query.societyId;
    const query = rawSocietyId ? { societyId: rawSocietyId } : {};
    const polls = await Poll.find(query).sort({ createdAt: -1 });

    const formatted = polls.map(p => {
      const userVote = p.votes.find(v => v.userId?.toString() === req.user._id.toString());
      const totalVotes = p.votes.length;

      return {
        ...p.toObject(),
        hasVoted: !!userVote,
        votedOptionIndex: userVote ? userVote.optionIndex : null,
        totalVotes,
        options: p.options.map((opt, idx) => ({
          text: opt.text,
          votesCount: opt.votesCount,
          percentage: totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0
        }))
      };
    });

    res.json({ success: true, polls: formatted });
  } catch (err) {
    next(err);
  }
};

const createPoll = async (req, res, next) => {
  try {
    const societyId = req.user.societyId || req.body.societyId;
    const { title, description, options, expiresAt } = req.body;

    const formattedOptions = (options || []).map(opt => ({
      text: typeof opt === 'string' ? opt : opt.text,
      votesCount: 0
    }));

    const poll = await Poll.create({
      societyId,
      title,
      description,
      options: formattedOptions,
      expiresAt: expiresAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Poll published successfully', poll });
  } catch (err) {
    next(err);
  }
};

const voteOnPoll = async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });
    if (new Date() > new Date(poll.expiresAt)) {
      return res.status(400).json({ success: false, message: 'This poll has ended.' });
    }

    const existingVote = poll.votes.find(v => v.userId?.toString() === req.user._id.toString());
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You have already voted on this poll.' });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ success: false, message: 'Invalid option selected.' });
    }

    poll.votes.push({
      userId: req.user._id,
      optionIndex,
      votedAt: new Date()
    });

    poll.options[optionIndex].votesCount += 1;
    await poll.save();

    res.json({ success: true, message: 'Vote recorded successfully!' });
  } catch (err) {
    next(err);
  }
};

// --- DOCUMENTS ---
const getDocuments = async (req, res, next) => {
  try {
    const rawSocietyId = req.user.societyId || req.query.societyId;
    const { category } = req.query;

    const query = rawSocietyId ? { societyId: rawSocietyId } : {};
    if (category && category !== 'all') query.category = category;

    const documents = await Document.find(query).sort({ createdAt: -1 }).populate('uploadedBy', 'fullName');
    res.json({ success: true, documents });
  } catch (err) {
    next(err);
  }
};

const createDocument = async (req, res, next) => {
  try {
    const societyId = req.user.societyId || req.body.societyId;
    const { title, description, category, fileUrl, fileSize, fileType } = req.body;

    const doc = await Document.create({
      societyId,
      title,
      description,
      category: category || 'guidelines',
      fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: fileSize || '1.5 MB',
      fileType: fileType || 'pdf',
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Document uploaded to repository', document: doc });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEvents,
  createEvent,
  registerForEvent,
  getPolls,
  createPoll,
  voteOnPoll,
  getDocuments,
  createDocument
};

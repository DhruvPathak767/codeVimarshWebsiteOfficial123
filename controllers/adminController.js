import Event from "../models/Event.model.js";
import Team from "../models/Team.model.js";
import Resource from "../models/Resource.model.js";
import User from "../models/User.model.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { deleteFromCloudinary } from "../util/cloudinaryHelper.js";

// Wait, I saw streamifier in package.json in Step 193. Yes it is there.

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: "code-vimarsh-events" },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const parseEventDateTime = (dateStr, timeStr) => {
  try {
    const datePart = new Date(dateStr).toISOString().split('T')[0];
    let startTimeStr = timeStr.split(/-|to/)[0].trim();
    const combinedStr = `${datePart} ${startTimeStr}`;
    const eventDate = new Date(combinedStr);
    if (isNaN(eventDate.getTime())) {
      return new Date(`${datePart}T09:00:00`);
    }
    return eventDate;
  } catch (e) {
    return new Date(dateStr);
  }
};

const adminController = {
  // Get Admin Dashboard
  getDashboard: async (req, res, next) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalResources = await Resource.countDocuments();

      const allEvents = await Event.find();
      const now = new Date();
      let upcomingEventsCount = 0;
      let completedEventsCount = 0;

      allEvents.forEach(event => {
        const evtDate = event.eventDate || event.date;
        if (evtDate >= now) {
          upcomingEventsCount++;
        } else {
          completedEventsCount++;
        }
      });
      const totalEvents = allEvents.length;

      // New Registrations (Last 7 Days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newRegistrations = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

      res.render("admin/dashboard", {
        pageTitle: "Dashboard - Admin",
        currentPage: "admin-dashboard",
        totalUsers,
        totalResources,
        totalEvents,
        upcomingEventsCount,
        completedEventsCount,
        newRegistrations,
        errorMessage: null
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  },

  // Get all events (Admin Dashboard)
  getEvents: async (req, res, next) => {
    try {
      const events = await Event.find().sort({ date: 1 });
      res.render("admin/events", {
        pageTitle: "Manage Events - Admin",
        currentPage: "admin-events",
        events,
        errorMessage: null
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  },

  // Get Add Event Form
  getAddEvent: (req, res, next) => {
    res.render("admin/edit-event", {
      pageTitle: "Add Event - Admin",
      currentPage: "admin-add-event",
      editing: false,
      event: null,
      errorMessage: null
    });
  },

  // Post Add Event
  postAddEvent: async (req, res, next) => {
    const { title, description, date, time, type, registrationLink } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(422).render("admin/edit-event", {
        pageTitle: "Add Event - Admin",
        currentPage: "admin-add-event",
        editing: false,
        event: { title, description, date, time, type, registrationLink },
        errorMessage: "Image is required."
      });
    }

    try {
      const result = await streamUpload(imageFile.buffer);
      const imageUrl = result.secure_url;

      const event = new Event({
        title,
        description,
        date,
        time,
        type,
        image: imageUrl,
        cloudinaryPublicId: result.public_id,
        eventDate: parseEventDateTime(date, time),
        registrationLink
      });

      await event.save();
      console.log("Event Created");
      res.redirect("/admin/events");
    } catch (err) {
      console.log(err);
      let msg = "An error occurred while creating the event.";
      if (err.errors) {
        msg = Object.values(err.errors).map(e => e.message).join(", ");
      }
      res.status(422).render("admin/edit-event", {
        pageTitle: "Add Event - Admin",
        currentPage: "admin-add-event",
        editing: false,
        event: { title, description, date, time, type, registrationLink },
        errorMessage: msg
      });
    }
  },

  // Get Edit Event Form
  getEditEvent: async (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
      return res.redirect("/");
    }
    const eventId = req.params.eventId;
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.redirect("/admin/events");
      }
      res.render("admin/edit-event", {
        pageTitle: "Edit Event - Admin",
        currentPage: "admin-edit-event",
        editing: editMode,
        event: event,
        errorMessage: null
      });
    } catch (err) {
      console.log(err);
      res.redirect("/admin/events");
    }
  },

  // Post Edit Event
  postEditEvent: async (req, res, next) => {
    const { eventId, title, description, date, time, type, registrationLink } = req.body;
    const imageFile = req.file;

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.redirect("/admin/events");
      }

      event.title = title;
      event.description = description;
      event.date = date;
      event.time = time;
      event.time = time;
      event.type = type;
      event.registrationLink = registrationLink;
      event.eventDate = parseEventDateTime(date, time);

      if (imageFile) {
        // Delete old image
        if (event.cloudinaryPublicId) {
          await deleteFromCloudinary(event.cloudinaryPublicId);
        }
        const result = await streamUpload(imageFile.buffer);
        event.image = result.secure_url;
        event.cloudinaryPublicId = result.public_id;
      }

      await event.save();
      console.log("Event Updated");
      res.redirect("/admin/events");
    } catch (err) {
      console.log(err);
      let msg = "An error occurred while updating the event.";
      if (err.errors) {
        msg = Object.values(err.errors).map(e => e.message).join(", ");
      }
      res.status(422).render("admin/edit-event", {
        pageTitle: "Edit Event - Admin",
        currentPage: "admin-edit-event",
        editing: true,
        event: { _id: eventId, title, description, date, time, type, registrationLink },
        errorMessage: msg
      });
    }
  },

  // Post Delete Event
  postDeleteEvent: async (req, res, next) => {
    const eventId = req.body.eventId;
    try {
      const event = await Event.findById(eventId);
      if (event) {
        if (event.cloudinaryPublicId) {
          await deleteFromCloudinary(event.cloudinaryPublicId);
        }
        await Event.findByIdAndDelete(eventId);
        console.log("Event Deleted");
      }
      res.redirect("/admin/events");
    } catch (err) {
      console.log(err);
      res.redirect("/admin/events");
    }
  },

  // --- Team Management ---

  // Get All Team Members (Admin)
  getTeam: async (req, res, next) => {
    try {
      const team = await Team.find().sort({ name: 1 });
      res.render("admin/team", {
        pageTitle: "Manage Team - Admin",
        currentPage: "admin-team",
        team,
        errorMessage: null
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  },

  // Get Add Member Form
  getAddMember: (req, res, next) => {
    res.render("admin/edit-team", {
      pageTitle: "Add Team Member - Admin",
      currentPage: "admin-add-member",
      editing: false,
      member: null,
      errorMessage: null
    });
  },

  // Post Add Member
  postAddMember: async (req, res, next) => {
    try {
      const { name, position, role, linkedin } = req.body;
      const imageFile = req.file;

      if (!imageFile) {
        return res.status(422).render("admin/edit-team", {
          pageTitle: "Add Team Member - Admin",
          currentPage: "admin-add-member",
          editing: false,
          member: { name, position, role, linkedin },
          errorMessage: "Image is required."
        });
      }

      const result = await streamUpload(imageFile.buffer);
      const imageUrl = result.secure_url;

      const member = new Team({
        name,
        position, // 'initiators' or 'members'
        role,     // Display role like 'President'
        image: imageUrl,
        cloudinaryPublicId: result.public_id,
        linkedin
      });

      await member.save();
      console.log("Team Member Added");
      res.redirect("/admin/team");
    } catch (err) {
      console.log(err);
      res.status(500).redirect("/admin/team");
    }
  },

  // Get Edit Member Form
  getEditMember: async (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
      return res.redirect("/admin/team");
    }
    const memberId = req.params.memberId;
    try {
      const member = await Team.findById(memberId);
      if (!member) {
        return res.redirect("/admin/team");
      }
      res.render("admin/edit-team", {
        pageTitle: "Edit Team Member - Admin",
        currentPage: "admin-edit-member",
        editing: editMode,
        member: member,
        errorMessage: null
      });
    } catch (err) {
      console.log(err);
      res.redirect("/admin/team");
    }
  },

  // Post Edit Member
  postEditMember: async (req, res, next) => {
    const { memberId, name, position, role, linkedin } = req.body;
    const imageFile = req.file;

    try {
      const member = await Team.findById(memberId);
      if (!member) {
        return res.redirect("/admin/team");
      }

      member.name = name;
      member.position = position;
      member.role = role;
      member.linkedin = linkedin;

      if (imageFile) {
        if (member.cloudinaryPublicId) {
          await deleteFromCloudinary(member.cloudinaryPublicId);
        }
        const result = await streamUpload(imageFile.buffer);
        member.image = result.secure_url;
        member.cloudinaryPublicId = result.public_id;
      }

      await member.save();
      console.log("Team Member Updated");
      res.redirect("/admin/team");
    } catch (err) {
      console.log(err);
      res.redirect("/admin/team");
    }
  },

  // Post Delete Member
  postDeleteMember: async (req, res, next) => {
    const memberId = req.body.memberId;
    try {
      const member = await Team.findById(memberId);
      if (member) {
        if (member.cloudinaryPublicId) {
          await deleteFromCloudinary(member.cloudinaryPublicId);
        }
        await Team.findByIdAndDelete(memberId);
        console.log("Team Member Deleted");
      }
      res.redirect("/admin/team");
    } catch (err) {
      console.log(err);
      res.redirect("/admin/team");
    }
  },
  // --- Resource Management ---

  // Get Resources (Admin)
  getResources: async (req, res, next) => {
    try {
      const resources = await Resource.find().sort({ createdAt: -1 });
      res.render("admin/resources", {
        pageTitle: "Manage Resources - Admin",
        currentPage: "admin-resources",
        resources,
        errorMessage: null,
        editing: false,
        resource: null
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  },

  // Post Add Resource
  postAddResource: async (req, res, next) => {
    try {
      const { title, description, link, category } = req.body;
      const imageFile = req.file;

      let imageUrl = 'https://via.placeholder.com/150'; // Default fallback
      let publicId = undefined;

      if (imageFile) {
        const result = await streamUpload(imageFile.buffer);
        imageUrl = result.secure_url;
        publicId = result.public_id;
      }

      const resource = new Resource({
        title,
        description,
        link,
        category,
        imageUrl: imageUrl,
        cloudinaryPublicId: publicId
      });

      await resource.save();
      console.log("Resource Created");
      res.redirect("/admin/resources");
    } catch (err) {
      console.log(err);
      res.redirect("/admin/resources");
    }
  },

  // Get Edit Resource Form
  getEditResource: async (req, res, next) => {
    const resourceId = req.params.resourceId;
    try {
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.redirect("/admin/resources");
      }
      res.render("admin/edit-resource", {
        pageTitle: "Edit Resource - Admin",
        currentPage: "admin-edit-resource",
        resource: resource,
        errorMessage: null
      });
    } catch (err) {
      console.log(err);
      res.redirect("/admin/resources");
    }
  },

  // Post Edit Resource
  postEditResource: async (req, res, next) => {
    const { resourceId, title, description, link, category } = req.body; // resourceId comes hidden
    const imageFile = req.file;

    try {
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.redirect('/admin/resources');
      }
      resource.title = title;
      resource.description = description;
      resource.link = link;
      resource.category = category;

      if (imageFile) {
        if (resource.cloudinaryPublicId) {
          await deleteFromCloudinary(resource.cloudinaryPublicId);
        }
        const result = await streamUpload(imageFile.buffer);
        resource.imageUrl = result.secure_url;
        resource.cloudinaryPublicId = result.public_id;
      }

      await resource.save();
      console.log("Resource Updated");
      res.redirect("/admin/resources");
    } catch (err) {
      console.log(err);
      res.redirect("/admin/resources");
    }
  },

  // Post Delete Resource
  postDeleteResource: async (req, res, next) => {
    const resourceId = req.body.resourceId;
    try {
      const resource = await Resource.findById(resourceId);
      if (resource) {
        if (resource.cloudinaryPublicId) {
          await deleteFromCloudinary(resource.cloudinaryPublicId);
        }
        await Resource.findByIdAndDelete(resourceId);
        console.log("Resource Deleted");
      }
      res.redirect("/admin/resources");
    } catch (err) {
      console.log(err);
      res.redirect("/admin/resources");
    }
  }
};

export default adminController;

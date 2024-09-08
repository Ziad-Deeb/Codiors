// authorization.js

const { User, Role, Permission, Problem, User_Problem } = require('../models/index');

const authorize = (requiredRoles, requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const { userId } = req;

      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            attributes: ['name'],
          },
          {
            model: Permission,
            attributes: ['name'],
          },
        ],
      });

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userRoles = user.Roles.map(role => role.name);
      const userPermissions = user.Permissions.map(permission => permission.name);

      const hasRequiredRoles = requiredRoles.some(role => userRoles.includes(role));
      const hasRequiredPermissions = requiredPermissions ? 
        requiredPermissions.every(permission => userPermissions.includes(permission)) : true;

      if (!hasRequiredRoles || !hasRequiredPermissions) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};

const userHasPermissionToAccessProblem = (permissions) => {
  return async (req, res, next) => {
    try {
      const { userId, params: { problem_id: problemId }, user: { roles: userRoles = [] } } = req;

      if (userRoles.includes('admin')) {
        return next();
      }

      const problem = await Problem.findByPk(problemId);

      if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
      }

      if (problem.visibility === 'public' && permissions.length === 1 && permissions[0] === 'can_read') {
        return next();
      }

      if (problem.owner_id === userId) {
        return next();
      }

      const userProblem = await User_Problem.findOne({
        where: {
          user_id: userId,
          problem_id: problemId,
        },
      });

      if (!userProblem) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const hasRequiredPermissions = permissions.every(permission => userProblem[permission]);

      const now = new Date();

      const canAccessBasedOnTime =
        (!userProblem.start_time || now >= userProblem.start_time) &&
        (!userProblem.end_time || now <= userProblem.end_time);

      if (!hasRequiredPermissions || !canAccessBasedOnTime) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (error) {
      console.error('Permission error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};

module.exports = {
  authorize,
  userHasPermissionToAccessProblem
};
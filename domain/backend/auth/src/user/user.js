/**
 * Parse database User to UserDTO (excludes password)
 * @param {import('@ems/database').User} userModel
 * @returns {import('@ems/domain-shared-auth').UserDTO}
 */
export function parseUser(userModel) {
    return {
        userId: userModel.id,
        username: userModel.username,
        firstName: userModel.firstName,
        lastName: userModel.lastName,
        email: userModel.email,
        role: userModel.role
    }
}

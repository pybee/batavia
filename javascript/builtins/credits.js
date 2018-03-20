import { sys } from '../modules'

export default function credits() {
    sys.stdout.write('Thanks to all contributors, including those in AUTHORS, for supporting Batavia development. See https://github.com/pybee/batavia for more information\n')
}

credits.__name__ = 'credits'
credits.__doc__ = `credits()

interactive prompt objects for printing the license text, a list of
    contributors and the copyright notice.`
credits.$pyargs = {}